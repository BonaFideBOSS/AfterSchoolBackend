if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

async function getLessons() {
  var lessons = [];
  const URL = `/lessons`;
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  };
  try {
    var response = await fetch(URL, requestOptions);
    response = await response.json();
    lessons = response.lessons
  } catch (error) {
    console.log("Error getting list of lessons: " + error);
  }
  var lessonOptions = "";
  lessons.forEach((lesson) => {
    lessonOptions += `<option value="${lesson._id}">${lesson.subject}</option>`;
  });
  document
    .querySelector("#lessonId")
    .insertAdjacentHTML("beforeend", lessonOptions);
}

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<div class="d-flex gap-2 align-items-center justify-content-center">
      <span class="spinner-border spinner-border-sm"></span> Please wait...
    </div>`;

    const newInput = document.createElement("input");
    newInput.type = "hidden";
    newInput.name = "password";
    newInput.value = prompt("Enter password");
    form.appendChild(newInput);

    form.submit();
  });
});

function notify(message, color = "info", delay = 10000) {
  const toast = document.createElement("div");
  toast.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">AfterSchool</strong>
      <small>Now</small>
      <button type="button" class="btn-close" data-mdb-dismiss="toast"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;

  toast.classList.add("toast", "fade");

  document.body.appendChild(toast);

  const toastInstance = new mdb.Toast(toast, {
    stacking: true,
    hidden: true,
    position: "top-right",
    autohide: true,
    delay: delay,
    animation: true,
    color: color,
  });

  toastInstance.show();
}
