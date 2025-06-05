document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      document.getElementById("message").innerText =
        result.message || result.error;

      if (res.ok) {
        setTimeout(() => {
          window.location.href = "/login/login.html";
        }, 1500);
      }
    } catch (err) {
      document.getElementById("message").innerText = "Something went wrong";
      console.error(err);
    }
  });
