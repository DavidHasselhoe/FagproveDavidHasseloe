document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      localStorage.setItem("token", result.token);
      window.location.href = "/";
    } else {
      document.getElementById("message").innerText = result.error;
    }
  } catch (err) {
    document.getElementById("message").innerText = "Something went wrong";
    console.error(err);
  }
});
