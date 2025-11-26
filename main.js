(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const input = document.querySelector("#Telefonnummer-3");
    if (!input) {
      return;
    }

    // Let any value through so browser doesn't block submit
    input.setAttribute("pattern", ".*");

    // Get the form element
    const form = input.form || document.querySelector("form");

    // Grab the submit button in that form
    const submitButton = form
      ? form.querySelector('input[type="submit"], button[type="submit"]')
      : null;

    // flag for special "drugo" mode
    let drugoMode = false;

    // countries we allow, in order
    const allowedCountries = [
      "de", // Germany
      "rs", // Serbia
      "hr", // Croatia
      "ba", // Bosnia and Herzegovina
      "xk", // Kosovo
      "me", // Montenegro
      "mk", // North Macedonia
      "si", // Slovenia
      "al", // Albania
      "at", // Austria
    ];

    // translations for intl-tel-input country names
    const i18n = {
      Germany: "Njemačka",
      Serbia: "Srbija",
      Croatia: "Hrvatska",
      "Bosnia and Herzegovina": "Bosna i Hercegovina",
      Kosovo: "Kosovo",
      Montenegro: "Crna Gora",
      "North Macedonia": "Makedonija",
      Slovenia: "Slovenija",
      Albania: "Albanija",
      Austria: "Austrija",
    };

    // custom dropdown labels for UI
    const customLabelsByIso2 = {
      de: "Njemačka +49",
      rs: "Srbija +381",
      hr: "Hrvatska +385",
      ba: "Bosna i Hercegovina +387",
      xk: "Kosovo +383",
      me: "Crna Gora +382",
      mk: "Makedonija +389",
      si: "Slovenija +386",
      al: "Albanija +355",
      at: "Austrija +43",
    };

    // init intl-tel-input using global UMD API
    const iti = window.intlTelInput(input, {
      initialCountry: "de",
      onlyCountries: allowedCountries,
      i18n: i18n,
      separateDialCode: false,
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.2/build/js/utils.js",
    });

    // helper: get the selected flag wrapper + inner flag span
    function getFlagEls() {
      const wrapper = input.closest(".iti");
      if (!wrapper) return {};

      const flagWrapper = wrapper.querySelector(
        ".iti__selected-flag, .iti__selected-country"
      );
      if (!flagWrapper) return {};

      const flagIcon = flagWrapper.querySelector(".iti__flag");

      return { wrapper: flagWrapper, icon: flagIcon };
    }

    // restore normal intl-tel-input visuals (when leaving drugo)
    function restoreNormalFlagUI() {
      const els = getFlagEls();
      if (!els.wrapper) return;

      // remove any inline overrides we injected
      els.wrapper.style.boxShadow = "";
      els.wrapper.style.backgroundImage = "";

      if (els.icon) {
        els.icon.style.backgroundImage = "";
        els.icon.style.boxShadow = "";
        els.icon.style.display = "";
        els.icon.style.alignItems = "";
        els.icon.style.justifyContent = "";
        els.icon.style.fontSize = "";
        els.icon.style.fontWeight = "";
        els.icon.style.lineHeight = "";
        els.icon.style.border = "";
        els.icon.style.borderRadius = "";
        els.icon.style.padding = "";
        els.icon.style.minWidth = "";
        els.icon.style.height = "";
        els.icon.style.color = "";
        els.icon.textContent = "";
      }

      els.wrapper.removeAttribute("title");
      els.wrapper.removeAttribute("aria-label");
    }

    // apply drugo visuals inline: hide flag & shadow, nothing else
    function applydrugoFlagUI() {
      const els = getFlagEls();
      if (!els.wrapper) return;

      const dialNode = els.wrapper.querySelector(".iti__selected-dial-code");
      if (dialNode) {
        dialNode.textContent = "";
      }

      els.wrapper.setAttribute("title", "Drugo");
      els.wrapper.setAttribute("aria-label", "Drugo");
      els.wrapper.style.boxShadow = "none";
      els.wrapper.style.backgroundImage = "none";

      if (els.icon) {
        els.icon.textContent = "";
        els.icon.style.backgroundImage = "none";
        els.icon.style.boxShadow = "none";

        // visually just hide it without collapsing layout
        els.icon.style.display = "block";
        els.icon.style.minWidth = "20px";
        els.icon.style.height = "14px";
        els.icon.style.backgroundColor = "transparent";
        els.icon.style.border = "none";
        els.icon.style.padding = "0";
      }

      document.body.click();
    }

    // When user selects a normal country from the built-in list,
    // intl-tel-input fires "countrychange" on the input.
    // -> that means: leave drugo mode + restore visuals.
    input.addEventListener("countrychange", function () {
      drugoMode = false;
      restoreNormalFlagUI();
    });

    // relabel dropdown with our custom strings AND inject "drugo"
    function relabelDropdown() {
      const list = document.querySelector(".iti__country-list");
      if (!list) return;

      // 1. Relabel all normal countries
      const items = list.querySelectorAll(".iti__country");
      items.forEach(function (item) {
        const iso2 = item.getAttribute("data-country-code");
        const nice = customLabelsByIso2[iso2];
        if (!nice) return;

        const nameEl = item.querySelector(".iti__country-name");
        const dialEl = item.querySelector(".iti__dial-code");

        if (nameEl) {
          nameEl.textContent = nice;
        }
        if (dialEl) {
          dialEl.style.display = "none";
        }
      });

      // 2. Inject "drugo" entry if not already there
      if (!list.querySelector('.iti__country[data-country-code="dr"]')) {
        const drugoItem = document.createElement("li");
        drugoItem.className = "iti__country iti__standard";
        drugoItem.setAttribute("data-country-code", "dr");
        drugoItem.setAttribute("data-dial-code", "");
        drugoItem.innerHTML = [
          '<div class="iti__flag-box">',
          ' <span class="iti__flag iti__dr"></span>',
          "</div>",
          '<span class="iti__country-name">Drugo</span>',
          '<span class="iti__dial-code"></span>',
        ].join("");

        // Click handler: when user picks drugo
        drugoItem.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          drugoMode = true;
          applydrugoFlagUI();
        });

        list.appendChild(drugoItem);
      }
    }

    // run once initially so dropdown is localized + drugo injected
    relabelDropdown();

    // run again whenever dropdown opens (DOM is rebuilt)
    const selectedFlagWrapper = document.querySelector(
      ".iti__selected-flag, .iti__selected-country"
    );

    if (selectedFlagWrapper) {
      selectedFlagWrapper.addEventListener("click", function () {
        setTimeout(relabelDropdown, 0);
      });
    }

    // Build "+<dial><number>" manually if needed (for NON-drugo)
    function manualBuildInternational() {
      const countryData = iti.getSelectedCountryData(); // has dialCode
      if (!countryData || !countryData.dialCode) {
        return input.value;
      }

      const dial = countryData.dialCode; // e.g. "49"
      const raw = (input.value || "").trim();

      // Check if user already entered intl for this country
      // e.g. "+49..." or "0049..."
      let cleanedRaw = raw.replace(/\s+/g, "");
      const plusDial = "+" + dial;
      const zeroZeroDial = "00" + dial;

      if (
        cleanedRaw.startsWith(plusDial) ||
        cleanedRaw.startsWith(zeroZeroDial)
      ) {
        // normalize 0049 -> +49
        if (cleanedRaw.startsWith(zeroZeroDial)) {
          cleanedRaw = "+" + cleanedRaw.slice(2);
        }
        return cleanedRaw;
      }

      // Otherwise treat it as local format like "0176 1234567"
      let digits = raw.replace(/\D/g, "");

      // Drop leading 0 once ("0176" -> "176")
      if (digits.length > 1 && digits.charAt(0) === "0") {
        digits = digits.substring(1);
      }

      const combined = "+" + dial + digits;
      return combined;
    }

    // Decide final phone value we want to actually submit
    function getFinalSubmitValue() {
      // drugo mode: do NOT touch the number at all
      if (drugoMode) {
        return input.value || "";
      }

      // Otherwise try intl-tel-input formatter
      try {
        const intlVal = iti.getNumber(); // expected "+49..."
        if (intlVal && intlVal.trim() !== "") {
          return intlVal;
        }
      } catch (err) {
        // ignore, we'll fallback
      }

      // Fallback: manual build
      const manual = manualBuildInternational();
      if (manual && manual.trim() !== "") {
        return manual;
      }

      // Last resort: raw user value
      const rawBefore = input.value || "";
      return rawBefore;
    }

    // last-moment overwrite before Webflow packages the form
    function normalizeBeforeSubmit() {
      const finalVal = getFinalSubmitValue();
      input.value = finalVal;
    }

    if (submitButton) {
      submitButton.addEventListener("click", function () {
        normalizeBeforeSubmit();
      });
    }

    if (form) {
      form.addEventListener("submit", function () {
        normalizeBeforeSubmit();
      });
    }
  });
})();
