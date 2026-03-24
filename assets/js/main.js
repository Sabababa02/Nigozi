const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const reveals = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && reveals.length) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    {
      threshold: 0.05,
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
