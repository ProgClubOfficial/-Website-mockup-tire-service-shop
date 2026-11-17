(function () {
  const overlay = document.getElementById("requestModal");
  if (!overlay) {
    console.error("Не найден #requestModal — проверьте HTML");
    return;
  }

  const form = document.getElementById("requestForm");
  const status = document.getElementById("formStatus");
  const closeBtn = overlay.querySelector(".modal-close");

  function openModal(e) {
    if (e) e.preventDefault();
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => {
      const first = form.querySelector("input");
      if (first) first.focus();
    }, 100);
  }

  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  // Открытие модалки — только кнопки заявки
  document
    .querySelectorAll("[data-open-request], .request-btn, .cta-button")
    .forEach((btn) => {
      btn.addEventListener("click", openModal);
    });

  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
  });

  // Клик по карточке услуги
  document.querySelectorAll(".services-item").forEach((card) => {
    card.addEventListener("click", () => {
      const service = card.dataset.service;
      openModal();

      const select = document.getElementById("reqService");
      if (select && service) {
        select.value = service;
        if (select.value !== service) {
          console.warn("Опция не найдена для услуги:", service);
        }
      }
    });
  });

  // Маска телефона
  const phoneInput = document.getElementById("reqPhone");
  phoneInput.addEventListener("input", () => {
    let digits = phoneInput.value.replace(/\D/g, "");
    
    if (digits.length === 0) {
      phoneInput.value = "";
      return;
    }

    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);

    let out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 5) out += ") " + digits.slice(4, 7);
    if (digits.length >= 8) out += "-" + digits.slice(7, 9);
    if (digits.length >= 10) out += "-" + digits.slice(9, 11);

    phoneInput.value = out;
  });

  // Валидация
  function setError(input, msg) {
    input.classList.toggle("invalid", !!msg);
    const errEl = form.querySelector(`[data-error-for="${input.id}"]`);
    if (errEl) errEl.textContent = msg || "";
  }

  function validate() {
    let ok = true;

    const name = document.getElementById("reqName");
    if (name.value.trim().length < 2) {
      setError(name, "Укажите имя (минимум 2 символа)");
      ok = false;
    } else setError(name, "");

    const phone = document.getElementById("reqPhone");
    const digits = phone.value.replace(/\D/g, "");
    if (digits.length !== 11) {
      setError(phone, "Введите корректный номер телефона");
      ok = false;
    } else setError(phone, "");

    const consent = form.querySelector('input[name="consent"]');
    if (!consent.checked) {
      form.querySelector('[data-error-for="consent"]').textContent =
        "Нужно согласие на обработку данных";
      ok = false;
    } else {
      form.querySelector('[data-error-for="consent"]').textContent = "";
    }

    return ok;
  }

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", () => {
      if (el.classList.contains("invalid")) setError(el, "");
    });
  });

  // Отправка
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    status.textContent = "";
    status.className = "form-status";

    if (!validate()) return;

    const submitBtn = form.querySelector(".form-submit");
    const originalBtnText = submitBtn.textContent;
    
    // Включаем режим загрузки
    submitBtn.disabled = true;
    submitBtn.classList.add("loading"); 
    
    status.textContent = "Отправляем заявку. Пожалуйста, подождите...";
    status.classList.add("loading");

    const data = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      service: form.elements.service.value,
      comment: form.elements.comment.value.trim(),
      website: form.elements.website?.value || "",
    };

    try {
      const resp = await fetch(
        "https://server-mockup-tire-service-shop-1.onrender.com/api/request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await resp.json();

      if (!resp.ok || !result.ok) {
        throw new Error(result.error || "Ошибка отправки");
      }

      // УСПЕХ
      status.className = "form-status success"; 
      status.textContent = "Спасибо! Заявка отправлена — мы скоро свяжемся с вами.";
      form.reset();
      
      // Закрываем модалку через 2.5 секунды
      setTimeout(closeModal, 2500);

    } catch (err) {
      console.error(err);
      // ОШИБКА
      status.className = "form-status error"; 
      status.textContent = "Не удалось отправить. Позвоните нам: +7 (952) 089-36-38";
      
    } finally 
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
      submitBtn.textContent = originalBtnText;
    }
  });
})();

// ===== Бургер-меню =====
(function () {
  const menuBtn = document.querySelector(".menu-btn");
  const menu = document.getElementById("mobileMenu");
  if (!menuBtn || !menu) return;

  function toggleMenu(force) {
    const willOpen =
      typeof force === "boolean" ? force : !menu.classList.contains("open");
    menu.classList.toggle("open", willOpen);
    menuBtn.setAttribute("aria-expanded", String(willOpen));
    menu.setAttribute("aria-hidden", String(!willOpen));
  }

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    if (menu.contains(e.target) || menuBtn.contains(e.target)) return;
    toggleMenu(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      toggleMenu(false);
      menuBtn.focus();
    }
  });
})();
