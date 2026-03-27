const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  const mobileNavMedia = window.matchMedia("(max-width: 960px)");

  const syncNavAccessibility = () => {
    const isMobile = mobileNavMedia.matches;
    const isOpen = siteNav.classList.contains("is-open");

    siteNav.inert = isMobile && !isOpen;

    if (!isMobile) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    syncNavAccessibility();
  });

  siteNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
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
  syncNavAccessibility();
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
const homeHeroTitle = document.querySelector(".page-home .hero-copy h1");
const homeHeroNextSection = homeHero?.nextElementSibling;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileHeroTitleMotion = window.matchMedia("(max-width: 640px)");

if (homeHero && homeHeroTitle && !prefersReducedMotion.matches) {
  let heroTitleTicking = false;

  const updateHeroTitleShift = () => {
    const heroRange = Math.max(homeHero.offsetHeight * 0.9, 1);
    const progress = Math.min(Math.max(window.scrollY / heroRange, 0), 1);
    const maxShift = mobileHeroTitleMotion.matches ? 60 : 28;
    const shift = -(progress * maxShift);
    const nextSectionDistance = homeHeroNextSection
      ? Math.max(homeHeroNextSection.offsetTop - homeHero.offsetTop, 1)
      : 0;
    const fadeRange = Math.max(
      nextSectionDistance || homeHero.offsetHeight * (mobileHeroTitleMotion.matches ? 1.02 : 0.95),
      1
    );
    const opacityProgress = Math.min(Math.max(window.scrollY / fadeRange, 0), 1);
    const heroOpacity = 1 - opacityProgress;

    homeHeroTitle.style.setProperty("--hero-title-shift", `${shift.toFixed(2)}px`);
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
  requestHeroTitleShift();
}

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const track = carousel.querySelector(".carousel-track");
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const prevButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");
  const dots = [...document.querySelectorAll(".carousel-dots .dot")];

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
