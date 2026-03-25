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

  mobileNavMedia.addEventListener("change", syncNavAccessibility);
  syncNavAccessibility();
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
