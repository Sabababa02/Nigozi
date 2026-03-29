const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");

if (navToggle && siteNav && siteHeader) {
  const mobileNavMedia = window.matchMedia("(max-width: 960px)");
  let navTransitionTimer = null;
  const updateMobileHeaderOffset = () => {
    if (!mobileNavMedia.matches) {
      document.documentElement.style.removeProperty("--mobile-header-offset");
      return;
    }

    const headerRect = siteHeader.getBoundingClientRect();
    const visibleHeaderBottom = Math.max(Math.min(headerRect.bottom, siteHeader.offsetHeight), 0);
    document.documentElement.style.setProperty("--mobile-header-offset", `${visibleHeaderBottom}px`);
  };

  const syncNavAccessibility = () => {
    const isMobile = mobileNavMedia.matches;
    const isOpen = siteNav.classList.contains("is-open");

    updateMobileHeaderOffset();
    siteNav.inert = isMobile && !isOpen;
    document.body.classList.toggle("menu-open", isMobile && isOpen);
    navToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");

    if (!isMobile) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    syncNavAccessibility();
  });

  siteNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", event => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank"
      ) {
        return;
      }

      const href = link.getAttribute("href") || "";
      if (!href || !href.startsWith("#")) {
        event.preventDefault();

        if (navTransitionTimer) {
          window.clearTimeout(navTransitionTimer);
          navTransitionTimer = null;
        }

        siteNav.querySelectorAll("a").forEach(otherLink => {
          otherLink.classList.remove("is-target-active");
          if (otherLink !== link) {
            otherLink.classList.remove("active");
          }
        });

        link.classList.add("is-target-active");

        navTransitionTimer = window.setTimeout(() => {
          window.location.assign(link.href);
        }, 70);
        return;
      }

      if (!mobileNavMedia.matches) {
        return;
      }

      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      syncNavAccessibility();
    });
  });

  if (typeof mobileNavMedia.addEventListener === "function") {
    mobileNavMedia.addEventListener("change", syncNavAccessibility);
  } else if (typeof mobileNavMedia.addListener === "function") {
    mobileNavMedia.addListener(syncNavAccessibility);
  }
  window.addEventListener("resize", updateMobileHeaderOffset);
  syncNavAccessibility();
}

const tapFeedbackMedia = window.matchMedia("(hover: none) and (pointer: coarse)");
const tapFeedbackTargets = document.querySelectorAll(
  ".button, .carousel-button, .nav-toggle, .contact-instant-button"
);

if (tapFeedbackTargets.length) {
  const tapFeedbackTimers = new WeakMap();

  const clearTapFeedback = target => {
    const existingTimer = tapFeedbackTimers.get(target);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      tapFeedbackTimers.delete(target);
    }

    target.classList.remove("is-tapped");
  };

  const applyTapFeedback = target => {
    if (!tapFeedbackMedia.matches) {
      return;
    }

    clearTapFeedback(target);
    target.classList.add("is-tapped");

    const timer = window.setTimeout(() => {
      target.classList.remove("is-tapped");
      tapFeedbackTimers.delete(target);
    }, 170);

    tapFeedbackTimers.set(target, timer);
  };

  tapFeedbackTargets.forEach(target => {
    target.addEventListener("pointerdown", event => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") {
        return;
      }

      applyTapFeedback(target);
    });

    target.addEventListener("blur", () => clearTapFeedback(target));
    target.addEventListener("pointercancel", () => clearTapFeedback(target));
  });
}

const reveals = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && reveals.length) {
  const revealThreshold = 0.18;
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const isVisibleEnough = entry.isIntersecting && entry.intersectionRatio >= revealThreshold;
        if (!isVisibleEnough) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: [0, revealThreshold],
      rootMargin: "0px 0px -12% 0px",
    }
  );

  reveals.forEach(element => {
    if (!element.classList.contains("is-visible")) {
      revealObserver.observe(element);
    }
  });
} else {
  reveals.forEach(element => element.classList.add("is-visible"));
}

const updateScrollState = () => {
  document.body.classList.toggle("is-scrolled", window.scrollY > 20);
};

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const homeHero = document.querySelector(".page-home .hero-home");
const homeHeroNextSection = homeHero?.nextElementSibling;
const heroImageSections = [...document.querySelectorAll(".hero-home, .inner-hero")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileHeroTitleMotion = window.matchMedia("(max-width: 960px)");

if (homeHero && !prefersReducedMotion.matches) {
  let heroTitleTicking = false;

  const resetHomeHeroMotion = () => {
    homeHero.style.removeProperty("--hero-title-shift");
    homeHero.style.removeProperty("--hero-scroll-opacity");
  };

  const updateHeroTitleShift = () => {
    if (!mobileHeroTitleMotion.matches) {
      resetHomeHeroMotion();
      heroTitleTicking = false;
      return;
    }

    const heroRange = Math.max(homeHero.offsetHeight * 0.9, 1);
    const progress = Math.min(Math.max(window.scrollY / heroRange, 0), 1);
    const maxShift = 60;
    const shift = -(progress * maxShift);
    const nextSectionDistance = homeHeroNextSection
      ? Math.max(homeHeroNextSection.offsetTop - homeHero.offsetTop, 1)
      : 0;
    const fadeRange = Math.max(
      nextSectionDistance || homeHero.offsetHeight * 1.02,
      1
    );
    const opacityProgress = Math.min(Math.max(window.scrollY / fadeRange, 0), 1);
    const heroOpacity = 1 - opacityProgress;

    homeHero.style.setProperty("--hero-title-shift", `${shift.toFixed(2)}px`);
    homeHero.style.setProperty("--hero-scroll-opacity", heroOpacity.toFixed(3));
    heroTitleTicking = false;
  };

  const requestHeroTitleShift = () => {
    if (heroTitleTicking) {
      return;
    }

    heroTitleTicking = true;
    window.requestAnimationFrame(updateHeroTitleShift);
  };

  window.addEventListener("scroll", requestHeroTitleShift, { passive: true });
  window.addEventListener("resize", requestHeroTitleShift);
  if (typeof mobileHeroTitleMotion.addEventListener === "function") {
    mobileHeroTitleMotion.addEventListener("change", requestHeroTitleShift);
  } else if (typeof mobileHeroTitleMotion.addListener === "function") {
    mobileHeroTitleMotion.addListener(requestHeroTitleShift);
  }
  requestHeroTitleShift();
}

if (heroImageSections.length && !prefersReducedMotion.matches) {
  let heroImageTicking = false;

  const resetHeroImageMotion = () => {
    heroImageSections.forEach(section => {
      section.style.removeProperty("--hero-image-shift");
      section.style.removeProperty("--hero-scroll-opacity");
      section.style.removeProperty("--hero-title-shift");
    });
  };

  const updateHeroImageShift = () => {
    if (!mobileHeroTitleMotion.matches) {
      resetHeroImageMotion();
      heroImageTicking = false;
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

    heroImageSections.forEach(section => {
      const localScroll = Math.max(window.scrollY - section.offsetTop, 0);
      const progress = Math.min(localScroll / Math.max(section.offsetHeight, 1), 1);
      const imageShift = progress * 84;
      section.style.setProperty("--hero-image-shift", `${imageShift.toFixed(2)}px`);

      if (section === homeHero) {
        return;
      }

      const titleShift = -(progress * 60);
      section.style.setProperty("--hero-title-shift", `${titleShift.toFixed(2)}px`);

      const nextSectionDistance = section.nextElementSibling
        ? Math.max(section.nextElementSibling.offsetTop - section.offsetTop, 1)
        : 0;
      const fadeRange = Math.max(nextSectionDistance || section.offsetHeight * 1.02, 1);
      const opacityProgress = Math.min(Math.max(window.scrollY / fadeRange, 0), 1);
      const heroOpacity = 1 - opacityProgress;
      section.style.setProperty("--hero-scroll-opacity", heroOpacity.toFixed(3));
    });

    heroImageTicking = false;
  };

  const requestHeroImageShift = () => {
    if (heroImageTicking) {
      return;
    }

    heroImageTicking = true;
    window.requestAnimationFrame(updateHeroImageShift);
  };

  window.addEventListener("scroll", requestHeroImageShift, { passive: true });
  window.addEventListener("resize", requestHeroImageShift);
  if (typeof mobileHeroTitleMotion.addEventListener === "function") {
    mobileHeroTitleMotion.addEventListener("change", requestHeroImageShift);
  } else if (typeof mobileHeroTitleMotion.addListener === "function") {
    mobileHeroTitleMotion.addListener(requestHeroImageShift);
  }
  requestHeroImageShift();
}

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const track = carousel.querySelector(".carousel-track");
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const prevButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");
  const dots = [...document.querySelectorAll(".carousel-dots .dot")];
  const mobileCarouselMedia = window.matchMedia("(max-width: 960px)");

  const getStep = () => {
    if (!slides.length) {
      return 0;
    }

    const slideStyle = window.getComputedStyle(track);
    const gap = Number.parseFloat(slideStyle.columnGap || slideStyle.gap || "0");
    return slides[0].getBoundingClientRect().width + gap;
  };

  const syncDots = () => {
    const step = getStep();
    if (!step) {
      return;
    }

    const index = Math.max(0, Math.min(dots.length - 1, Math.round(track.scrollLeft / step)));

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  prevButton?.addEventListener("click", () => {
    track.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  nextButton?.addEventListener("click", () => {
    track.scrollBy({ left: getStep(), behavior: "smooth" });
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      track.scrollTo({ left: getStep() * index, behavior: "smooth" });
    });
  });

  track.addEventListener("scroll", syncDots, { passive: true });
  window.addEventListener("resize", syncDots);
  syncDots();
}

const faqQuestions = document.querySelectorAll(".faq-question");
const setFaqExpanded = (question, answer, expanded) => {
  question.setAttribute("aria-expanded", String(expanded));
  answer.hidden = false;
  answer.setAttribute("aria-hidden", String(!expanded));
};

faqQuestions.forEach(question => {
  const answer = question.nextElementSibling;
  if (!answer) {
    return;
  }

  const expanded = question.getAttribute("aria-expanded") === "true";
  answer.hidden = false;
  answer.setAttribute("aria-hidden", String(!expanded));

  question.addEventListener("click", () => {
    const isExpanded = question.getAttribute("aria-expanded") === "true";

    faqQuestions.forEach(otherQuestion => {
      const otherAnswer = otherQuestion.nextElementSibling;
      if (!otherAnswer) {
        return;
      }

      if (otherQuestion === question) {
        setFaqExpanded(otherQuestion, otherAnswer, !isExpanded);
        return;
      }

      setFaqExpanded(otherQuestion, otherAnswer, false);
    });
  });
});

const mailtoForms = document.querySelectorAll("[data-mailto-form]");

mailtoForms.forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(form);
    const to = form.getAttribute("data-mailto-to") || "bonjour@nigozi.fr";
    const subjectBase = form.getAttribute("data-mailto-subject") || "Demande de devis - Nigozi";

    const nom = String(formData.get("nom") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const telephone = String(formData.get("telephone") || "").trim();
    const typeEvenement = String(formData.get("type_evenement") || "").trim();
    const dateEvenement = String(formData.get("date_evenement") || "").trim();
    const nombrePersonnes = String(formData.get("nombre_personnes") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const subject = typeEvenement ? `${subjectBase} - ${typeEvenement}` : subjectBase;

    const lines = [
      "Bonjour Nigozi,",
      "",
      "Je souhaite demander un devis pour un evenement.",
      "",
      `Nom : ${nom || "-"}`,
      `Email : ${email || "-"}`,
      `Telephone : ${telephone || "-"}`,
      `Type d'evenement : ${typeEvenement || "-"}`,
      `Date : ${dateEvenement || "-"}`,
      `Nombre de personnes : ${nombrePersonnes || "-"}`,
      "",
      "Message :",
      message || "-",
    ];

    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      lines.join("\n")
    )}`;

    window.location.href = mailtoUrl;
  });
});
