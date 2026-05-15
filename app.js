const setCurrentYear = () => {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
};

const highlightCurrentPage = () => {
  const page = document.body.dataset.page;
  const routeMap = {
    home: "index.html",
    story: "our-story.html",
    events: "events.html",
    contact: "contact.html",
  };

  const currentHref = routeMap[page];
  document.querySelectorAll(".site-nav a").forEach((link) => {
    if (link.getAttribute("href") === currentHref) {
      link.setAttribute("aria-current", "page");
    }
  });
};

const setupMenu = () => {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
};

const setupRibbon = () => {
  const tracks = document.querySelectorAll("[data-auto-track]");
  if (!tracks.length) return;

  const mobileMedia = window.matchMedia("(max-width: 820px)");

  tracks.forEach((track) => {
    let frameId = null;
    let direction = 1;
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let isPaused = false;

    const maxScroll = () => track.scrollWidth - track.clientWidth;

    const tick = () => {
      if (mobileMedia.matches && !isPaused && maxScroll() > 0) {
        if (track.scrollLeft <= 0) direction = 1;
        if (track.scrollLeft >= maxScroll() - 1) direction = -1;
        track.scrollLeft += 0.45 * direction;
      }
      frameId = window.requestAnimationFrame(tick);
    };

    const pause = () => {
      isPaused = true;
    };

    const resume = () => {
      isPaused = false;
    };

    track.addEventListener("pointerdown", (event) => {
      if (!mobileMedia.matches) return;
      pointerId = event.pointerId;
      track.setPointerCapture(pointerId);
      track.classList.add("is-dragging");
      startX = event.clientX;
      startScroll = track.scrollLeft;
      pause();
    });

    track.addEventListener("pointermove", (event) => {
      if (!mobileMedia.matches || pointerId !== event.pointerId) return;
      const delta = event.clientX - startX;
      track.scrollLeft = startScroll - delta;
    });

    const release = (event) => {
      if (pointerId !== event.pointerId) return;
      track.classList.remove("is-dragging");
      track.releasePointerCapture(pointerId);
      pointerId = null;
      resume();
    };

    track.addEventListener("pointerup", release);
    track.addEventListener("pointercancel", release);
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);
    track.addEventListener("focusin", pause);
    track.addEventListener("focusout", resume);

    frameId = window.requestAnimationFrame(tick);

    window.addEventListener("beforeunload", () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    });
  });
};

const copyText = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(helper);
  return copied;
};

const setupInquiryForm = () => {
  const form = document.querySelector("[data-inquiry-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const organization = formData.get("organization");
    const subject = formData.get("subject");
    const message = formData.get("message");

    const inquiryNote = [
      "BICA NYC Inquiry",
      `Subject: ${subject}`,
      `Name: ${name}`,
      `Email: ${email}`,
      organization ? `Organization: ${organization}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await copyText(inquiryNote);
      if (status) status.textContent = "Inquiry note copied. You can now send it through the chapter's preferred channel.";
    } catch (error) {
      if (status) status.textContent = "Copy was blocked on this device. Select the text and copy it manually.";
      window.prompt("Copy your inquiry note:", inquiryNote);
    }
  });
};

setCurrentYear();
highlightCurrentPage();
setupMenu();
setupRibbon();
setupInquiryForm();
