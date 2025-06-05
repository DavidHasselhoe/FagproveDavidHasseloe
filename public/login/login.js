document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    document.getElementById("message").innerText =
      result.message || result.error;

    if (res.ok && result.token) {
      localStorage.setItem("token", result.token);

      setTimeout(() => {
        window.location.href = "/index/index.html";
      }, 1500);
    }
  } catch (err) {
    document.getElementById("message").innerText = "Login failed";
    console.error(err);
  }
});
