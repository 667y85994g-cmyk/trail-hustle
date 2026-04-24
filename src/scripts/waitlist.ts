export function initWaitlist() {
  const run = () => {
    const form = document.querySelector<HTMLFormElement>("[data-waitlist-form]");
    const success = document.querySelector<HTMLElement>("[data-waitlist-success]");
    const error = document.querySelector<HTMLElement>("[data-waitlist-error]");
    if (!form || !success || !error) return;

    const submitBtn = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );
    const input = form.querySelector<HTMLInputElement>('input[type="email"]');

    const clearError = () => {
      error.textContent = "";
      error.classList.add("hidden");
    };

    const showError = (message: string) => {
      error.textContent = message;
      error.classList.remove("hidden");
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearError();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          form.classList.add("hidden");
          success.classList.remove("hidden");
          if (input) input.value = "";
          return;
        }

        let message = "Something went wrong. Please try again.";
        try {
          const data = await response.json();
          if (data?.errors?.[0]?.message) {
            message = data.errors[0].message;
          } else if (data?.error) {
            message = data.error;
          }
        } catch {
          /* keep default message */
        }
        showError(message);
      } catch {
        showError("Network error. Please try again.");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
