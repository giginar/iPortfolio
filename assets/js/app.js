/*
 * Static partial loader + UI initializer for AWS Amplify hosting.
 * It loads HTML partials first, then initializes BootstrapMade/iPortfolio behaviours.
 */
(function () {
  "use strict";

  async function includePartials() {
    const includeTargets = Array.from(document.querySelectorAll("[data-include]"));

    await Promise.all(
      includeTargets.map(async (target) => {
        const file = target.getAttribute("data-include");

        try {
          const response = await fetch(file, { cache: "no-cache" });

          if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
          }

          target.outerHTML = await response.text();
        } catch (error) {
          console.error(`Could not load partial: ${file}`, error);
          target.innerHTML = `<!-- Could not load ${file} -->`;
        }
      })
    );
  }

  function initHeaderToggle() {
    const headerToggleBtn = document.querySelector(".header-toggle");
    if (!headerToggleBtn) return;

    const toggleHeader = () => {
      document.querySelector("body").classList.toggle("header-show");
      headerToggleBtn.classList.toggle("bi-list");
      headerToggleBtn.classList.toggle("bi-x");
    };

    headerToggleBtn.addEventListener("click", toggleHeader);

    document.querySelectorAll("#navmenu a").forEach((navLink) => {
      navLink.addEventListener("click", () => {
        if (document.querySelector(".header-show")) {
          toggleHeader();
        }
      });
    });
  }

  function initScrollTop() {
    const scrollTop = document.querySelector(".scroll-top");
    if (!scrollTop) return;

    const toggleScrollTop = () => {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    };

    scrollTop.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("load", toggleScrollTop);
    document.addEventListener("scroll", toggleScrollTop);
    toggleScrollTop();
  }

  function initNavScrollSpy() {
    const navLinks = document.querySelectorAll(".navmenu a");

    const updateActiveLink = () => {
      const position = window.scrollY + 200;

      navLinks.forEach((navLink) => {
        if (!navLink.hash) return;

        const section = document.querySelector(navLink.hash);
        if (!section) return;

        if (
          position >= section.offsetTop &&
          position <= section.offsetTop + section.offsetHeight
        ) {
          document.querySelectorAll(".navmenu a.active").forEach((link) => {
            link.classList.remove("active");
          });

          navLink.classList.add("active");
        } else {
          navLink.classList.remove("active");
        }
      });
    };

    window.addEventListener("load", updateActiveLink);
    document.addEventListener("scroll", updateActiveLink);
    updateActiveLink();
  }

  function initAos() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 600,
        easing: "ease-in-out",
        once: true,
        mirror: false,
      });
    }
  }

  function initTyped() {
    if (typeof Typed === "undefined") return;

    document.querySelectorAll(".typed").forEach((typedElement) => {
      const typedItems = typedElement.getAttribute("data-typed-items");
      if (!typedItems) return;

      new Typed(typedElement, {
        strings: typedItems.split(",").map((item) => item.trim()),
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
        loop: true,
      });
    });
  }

  function updateSoftwareExperienceYears() {
    const experienceElement = document.getElementById("software-experience-years");
    if (!experienceElement) return;

    const startDateValue = experienceElement.dataset.experienceStart;
    if (!startDateValue) return;

    const startDate = new Date(startDateValue);
    const now = new Date();

    if (Number.isNaN(startDate.getTime()) || now < startDate) {
      experienceElement.setAttribute("data-purecounter-end", "0");
      return;
    }

    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
    const diffInMilliseconds = now.getTime() - startDate.getTime();

    /*
     * Math.ceil intentionally rounds up.
     * Example:
     * August 2021 -> May 2026 becomes 5 years, not 4.
     */
    const yearsOfExperience = Math.ceil(diffInMilliseconds / millisecondsInYear);

    experienceElement.setAttribute(
      "data-purecounter-end",
      String(yearsOfExperience)
    );
  }

  function initPureCounter() {
    if (typeof PureCounter !== "undefined") {
      new PureCounter();
    }
  }

  function initGlightbox() {
    if (typeof GLightbox !== "undefined") {
      GLightbox({ selector: ".glightbox" });
    }
  }

  function initPortfolioIsotope() {
    if (typeof Isotope === "undefined") return;

    document.querySelectorAll(".isotope-layout").forEach((layout) => {
      const container = layout.querySelector(".isotope-container");
      const filters = layout.querySelectorAll(".isotope-filters li");

      if (!container) return;

      const createIsotope = () => {
        const isotope = new Isotope(container, {
          itemSelector: ".isotope-item",
          layoutMode: layout.getAttribute("data-layout") || "masonry",
          filter: layout.getAttribute("data-default-filter") || "*",
          sortBy: layout.getAttribute("data-sort") || "original-order",
        });

        filters.forEach((filter) => {
          filter.addEventListener("click", function () {
            filters.forEach((item) => item.classList.remove("filter-active"));
            this.classList.add("filter-active");

            isotope.arrange({
              filter: this.getAttribute("data-filter"),
            });

            if (typeof AOS !== "undefined") {
              AOS.refresh();
            }
          });
        });
      };

      if (typeof imagesLoaded !== "undefined") {
        imagesLoaded(container, createIsotope);
      } else {
        createIsotope();
      }
    });
  }

  function removePreloader() {
    const preloader = document.querySelector("#preloader");

    if (preloader) {
      preloader.remove();
    }
  }

  async function boot() {
    await includePartials();

    initHeaderToggle();
    initScrollTop();
    initNavScrollSpy();
    initAos();
    initTyped();

    updateSoftwareExperienceYears();
    initPureCounter();

    initGlightbox();
    initPortfolioIsotope();
    removePreloader();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();