// main.js using classic <script> usage, no ES module imports

document.addEventListener("DOMContentLoaded", function () {
  const input    = document.querySelector("#Telefonnummer-3");
  const errorMsg = document.querySelector("#error-msg");
  const validMsg = document.querySelector("#valid-msg");
  const form     = document.querySelector("#demo-form");

  if (!input) {
    console.warn('Phone input "#Telefonnummer-3" not found.');
    return;
  }

  // Country settings
  const allowedCountries = [
    "de", "rs", "hr", "ba", "xk", "me", "mk", "si", "al", "at"
  ];

  const i18n = {
    "Germany": "Njemačka",
    "Serbia": "Srbija",
    "Croatia": "Hrvatska",
    "Bosnia and Herzegovina": "Bosna i Hercegovina",
    "Kosovo": "Kosovo",
    "Montenegro": "Crna Gora",
    "North Macedonia": "Makedonija",
    "Slovenia": "Slovenija",
    "Albania": "Albanija",
    "Austria": "Austrija"
  };

  // Initialize intl-tel-input via global function
  const iti = window.intlTelInput(input, {
    initialCountry: "de",
    onlyCountries: allowedCountries,
    i18n,
    separateDialCode: false,
    utilsScript:
      "https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.2/build/js/utils.js"
  });

  const errorTextByCode = [
    "Invalid number",
    "Invalid country code",
    "Too short",
    "Too long",
    "Invalid number"
  ];

  function resetValidationUI() {
    input.classList.remove("error");
    if (errorMsg) {
      errorMsg.textContent = "";
      errorMsg.classList.add("hide");
    }
    if (validMsg) {
      validMsg.classList.add("hide");
    }
  }

  function showValid() {
    if (!validMsg) return;
    validMsg.textContent = "Valid number";
    validMsg.classList.remove("hide");
    validMsg.style.color = "green";
  }

  function showError(code) {
    if (!errorMsg) return;
    const text = errorTextByCode[code] || "Invalid number";
    errorMsg.textContent = text;
    errorMsg.classList.remove("hide");
    errorMsg.style.color = "red";
    input.classList.add("error");
  }

  input.addEventListener("blur", function () {
    resetValidationUI();
    const raw = input.value.trim();
    if (!raw) return;

    if (iti.isValidNumber()) {
      showValid();
    } else {
      showError(iti.getValidationError());
    }
  });

  input.addEventListener("input", resetValidationUI);
  input.addEventListener("change", resetValidationUI);

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      input.value = iti.getNumber(); // normalized international format
    });
  }
});