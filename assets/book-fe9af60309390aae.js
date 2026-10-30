// 책 쪽마다 부르는 동작 하나 (contracts/book-html.md "동작"): 목차 접기 · 장 이동 · 복사 · 그림 단계. 인터넷 · 모듈 없이 돈다
(function () {
  var reader = document.querySelector(".reader");
  // [목차]: 모든 너비에서 접고 편다. 좁은 화면(--book-narrow-w 이하)은 쪽마다 접힌 채 시작하고, 펼치면 덮개다.
  // 넓은 화면은 쪽을 옮겨도 사람이 고른 접힘을 따른다(sessionStorage, 못 쓰면 늘 펼침) (FR-033 · FR-034)
  var toggle = document.querySelector(".toc-toggle");
  var narrow = window.matchMedia("(max-width: 720px)");
  function saved() {
    try { return sessionStorage.getItem("book-toc"); } catch (e) { return null; }
  }
  function open(on) {
    reader.setAttribute("data-toc", on ? "open" : "closed");
    if (toggle) toggle.setAttribute("aria-expanded", String(on));
  }
  if (toggle) toggle.addEventListener("click", function () {
    var on = reader.getAttribute("data-toc") !== "open";
    open(on);
    try { sessionStorage.setItem("book-toc", on ? "open" : "closed"); } catch (e) { /* 남기지 않는다 */ }
  });
  open(!narrow.matches && saved() !== "closed");
  // 장 이동: 앞뒤 쪽 파일로 (contracts "장 이동")
  [].forEach.call(document.querySelectorAll(".chapter-nav [data-href]"), function (button) {
    button.addEventListener("click", function () { location.href = button.getAttribute("data-href"); });
  });

  // 복사: 성공해야 복사됨, 아니면 코드를 선택하고 직접 복사하게 알린다
  [].forEach.call(document.querySelectorAll(".code-wrap .copy"), function (button) {
    button.addEventListener("click", function () {
      var wrap = button.closest(".code-wrap");
      var code = wrap.querySelector("code");
      var out = wrap.querySelector(".copy-result");
      function select() {
        var range = document.createRange();
        range.selectNodeContents(code);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        out.textContent = "선택됨 · Ctrl+C로 복사";
      }
      try {
        navigator.clipboard.writeText(code.getAttribute("data-code")).then(function () { out.textContent = "복사됨"; }, select);
      } catch (e) {
        select();
      }
    });
  });

  // 그림 단계: 그림마다 따로, 처음 · 끝을 넘지 않는다
  [].forEach.call(document.querySelectorAll(".book-figure"), function (figure) {
    var steps = figure.querySelector(".steps");
    if (!steps) return;
    var pictures = [].slice.call(figure.querySelectorAll("img"));
    var prev = steps.querySelector("[data-step-prev]");
    var next = steps.querySelector("[data-step-next]");
    var count = steps.querySelector(".step-count");
    var k = 0;
    function show() {
      pictures.forEach(function (p, i) { p.hidden = i !== k; });
      count.textContent = k + 1 + " / " + pictures.length;
      prev.disabled = k === 0;
      next.disabled = k === pictures.length - 1;
    }
    prev.addEventListener("click", function () { if (k > 0) { k--; show(); } });
    next.addEventListener("click", function () { if (k < pictures.length - 1) { k++; show(); } });
    show();
  });

})();
