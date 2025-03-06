({
  toggleAnswer: function (component, event) {
    var target = event.currentTarget;
    var answer = target.querySelector(".faq-answer");

    // Toggle answer visibility by adding/removing 'show' class
    if (answer.classList.contains("show")) {
      answer.classList.remove("show");
    } else {
      answer.classList.add("show");
    }

    // Toggle open/closed state for dropdown effect
    target.classList.toggle("open");
  }
});
