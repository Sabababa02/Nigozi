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

const homepageHeroTypewriter = document.querySelector(".page-home [data-hero-typewriter]");

if (homepageHeroTypewriter) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headlineSegments = [
    ...homepageHeroTypewriter.querySelectorAll("[data-typewriter-headline] [data-typewriter-text]"),
  ];
  const bodyElement = homepageHeroTypewriter.querySelector("[data-typewriter-body]");

  const wrapCharacters = (element, startDelay, charInterval, variant) => {
    const text = element.textContent || "";
    const fragment = document.createDocumentFragment();

    Array.from(text).forEach((char, index) => {
      const span = document.createElement("span");
      span.className = variant === "body" ? "typewriter-char typewriter-char--body" : "typewriter-char";
      span.textContent = variant === "body" ? char : char === " " ? "\u00A0" : char;
      span.style.transitionDelay = `${startDelay + index * charInterval}ms`;
      fragment.append(span);
    });

    element.textContent = "";
    element.append(fragment);

    return startDelay + text.length * charInterval;
  };

  if (!prefersReducedMotion && (headlineSegments.length || bodyElement)) {
    try {
      let nextDelay = 0;
      const headlineInterval = 44;
      const bodyInterval = 8;

      headlineSegments.forEach(segment => {
        nextDelay = wrapCharacters(segment, nextDelay, headlineInterval, "headline");
      });

      if (bodyElement) {
        nextDelay += 120;
        nextDelay = wrapCharacters(bodyElement, nextDelay, bodyInterval, "body");
      }

      homepageHeroTypewriter.dataset.typewriterReady = "true";

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          homepageHeroTypewriter.dataset.typewriterStarted = "true";
        });
      });

      window.setTimeout(() => {
        homepageHeroTypewriter.dataset.typewriterComplete = "true";
      }, nextDelay + 360);
    } catch {
      delete homepageHeroTypewriter.dataset.typewriterReady;
      delete homepageHeroTypewriter.dataset.typewriterStarted;
      delete homepageHeroTypewriter.dataset.typewriterComplete;
    }
  } else {
    homepageHeroTypewriter.dataset.typewriterComplete = "true";
  }
}

const updateScrollState = () => {
  document.body.classList.toggle("is-scrolled", window.scrollY > 20);
};

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

const siteFooter = document.querySelector("[data-site-footer]");
const backToTopShell = document.querySelector("[data-back-to-top-shell]");
const backToTopButton = document.querySelector("[data-back-to-top]");

if (backToTopButton) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollElement = document.scrollingElement || document.documentElement;
  let backToTopFrame = null;

  const easeInOutSine = progress => -(Math.cos(Math.PI * progress) - 1) / 2;

  const scrollToTopSmoothly = () => {
    const startY = scrollElement.scrollTop;
    const duration = 920;
    const startTime = performance.now();

    if (backToTopFrame !== null) {
      window.cancelAnimationFrame(backToTopFrame);
    }

    const step = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutSine(progress);

      scrollElement.scrollTop = Math.round(startY * (1 - easedProgress));

      if (progress < 1) {
        backToTopFrame = window.requestAnimationFrame(step);
        return;
      }

      scrollElement.scrollTop = 0;
      backToTopFrame = null;
    };

    backToTopFrame = window.requestAnimationFrame(step);
  };

  backToTopButton.addEventListener("click", () => {
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
      return;
    }

    scrollToTopSmoothly();
  });
}

if (siteFooter && backToTopShell) {
  if ("IntersectionObserver" in window) {
    const footerObserver = new IntersectionObserver(
      entries => {
        const isFooterVisible = entries.some(entry => entry.isIntersecting);
        backToTopShell.classList.toggle("is-visible", isFooterVisible);
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -3% 0px",
      }
    );

    footerObserver.observe(siteFooter);
  } else {
    backToTopShell.classList.add("is-visible");
  }
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
