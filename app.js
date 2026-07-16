/* =========================================================
 * 판정 로직
 * 1) 각 질문의 슬라이더 값(0~100)을 t ∈ [-1, 1]로 변환 (100=A쪽, 0=B쪽)
 * 2) 가중치 wA=(1+t)/2, wB=(1-t)/2 로 A/B 벡터를 혼합해 4개 축에 누적
 * 3) 축별 누적값을 이론적 최대치로 나눠 [-1, 1]로 정규화
 * 4) 중간값 응답이 뭉치지 않도록 비선형 확장(sign·|v|^0.7) 적용
 * 5) 36개 동물 벡터와 유클리드 거리를 계산해 최솟값인 동물로 판정
 * ========================================================= */

const NUM_Q = QUESTIONS.length;
const NUM_AXES = AXES.length;

// 축별 이론적 최대 누적값 (정규화 분모)
const AXIS_MAX = Array.from({ length: NUM_AXES }, (_, k) =>
  QUESTIONS.reduce((sum, q) => sum + Math.max(Math.abs(q.va[k]), Math.abs(q.vb[k])), 0)
);

const answers = new Array(NUM_Q).fill(50); // 슬라이더 초기값: 중간
let current = 0;

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const screens = { intro: $("intro"), quiz: $("quiz"), result: $("result") };
const slider = $("slider");
const cardA = $("card-a");
const cardB = $("card-b");
const leanIndicator = $("lean-indicator");

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------- 질문 렌더링 ---------- */
function renderQuestion() {
  const q = QUESTIONS[current];
  $("q-num").textContent = current + 1;
  $("progress-fill").style.width = `${((current + 1) / NUM_Q) * 100}%`;
  $("q-situation").textContent = `Q${current + 1}. ${q.s}`;
  $("q-option-a").textContent = q.a;
  $("q-option-b").textContent = q.b;
  slider.value = answers[current];
  $("prev-btn").style.visibility = current === 0 ? "hidden" : "visible";
  $("next-btn").textContent = current === NUM_Q - 1 ? "결과 보기 🎉" : "다음 →";
  updateLeanUI();
}

function updateLeanUI() {
  const v = Number(slider.value);
  cardA.classList.toggle("leaning", v > 55);
  cardB.classList.toggle("leaning", v < 45);
  if (v > 55) {
    leanIndicator.textContent = `A에 ${v}% 가까움`;
  } else if (v < 45) {
    leanIndicator.textContent = `B에 ${100 - v}% 가까움`;
  } else {
    leanIndicator.textContent = "중간";
  }
}

/* ---------- 벡터 계산 ---------- */
function computeUserVector() {
  const acc = new Array(NUM_AXES).fill(0);
  QUESTIONS.forEach((q, i) => {
    const t = (answers[i] - 50) / 50; // [-1, 1], +면 A쪽
    const wA = (1 + t) / 2;
    const wB = (1 - t) / 2;
    for (let k = 0; k < NUM_AXES; k++) {
      acc[k] += wA * q.va[k] + wB * q.vb[k];
    }
  });
  // 정규화 + 비선형 확장
  return acc.map((v, k) => {
    const n = AXIS_MAX[k] ? v / AXIS_MAX[k] : 0;
    return Math.sign(n) * Math.pow(Math.abs(n), 0.7);
  });
}

function findAnimal(userVec) {
  let best = null;
  let bestDist = Infinity;
  for (const animal of ANIMALS) {
    let d = 0;
    for (let k = 0; k < NUM_AXES; k++) {
      d += (userVec[k] - animal.vec[k]) ** 2;
    }
    if (d < bestDist) {
      bestDist = d;
      best = animal;
    }
  }
  return best;
}

/* ---------- 결과 렌더링 ---------- */
let lastResult = null;

function renderResult() {
  const userVec = computeUserVector();
  const animal = findAnimal(userVec);
  lastResult = { userVec, animal };

  $("result-emoji").textContent = animal.emoji;
  $("result-title").textContent = animal.title;
  $("result-name").textContent = animal.name;
  $("result-desc").textContent = animal.desc;
  $("result-pros").textContent = animal.pros;
  $("result-cons").textContent = animal.cons;
  $("result-advice").textContent = animal.advice;

  const bars = $("axis-bars");
  bars.innerHTML = "";
  AXES.forEach((axis, k) => {
    const v = userVec[k]; // -1(left) ~ +1(right)
    const pct = ((v + 1) / 2) * 100;
    const row = document.createElement("div");
    row.className = "axis-row";
    row.innerHTML = `
      <div class="axis-labels">
        <span class="${v < 0 ? "on" : ""}">${axis.left}</span>
        <span class="${v >= 0 ? "on" : ""}">${axis.right}</span>
      </div>
      <div class="axis-track"><div class="axis-dot" style="left:${pct}%"></div></div>
    `;
    bars.appendChild(row);
  });

  showScreen("result");
}

/* ---------- 이벤트 ---------- */
$("start-btn").addEventListener("click", () => {
  current = 0;
  answers.fill(50);
  renderQuestion();
  showScreen("quiz");
});

slider.addEventListener("input", () => {
  answers[current] = Number(slider.value);
  updateLeanUI();
});

// 모바일: 슬라이더 조작 중 화면이 함께 스크롤되지 않도록 차단
slider.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
slider.parentElement.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

// 카드를 누르면 그쪽으로 크게 기울기
cardA.addEventListener("click", () => { slider.value = 90; answers[current] = 90; updateLeanUI(); });
cardB.addEventListener("click", () => { slider.value = 10; answers[current] = 10; updateLeanUI(); });

$("prev-btn").addEventListener("click", () => {
  if (current > 0) { current--; renderQuestion(); }
});

$("next-btn").addEventListener("click", () => {
  if (current < NUM_Q - 1) {
    current++;
    renderQuestion();
  } else {
    renderResult();
  }
});

$("retry-btn").addEventListener("click", () => {
  current = 0;
  answers.fill(50);
  showScreen("intro");
});

$("save-btn").addEventListener("click", async () => {
  if (!lastResult) return;
  const btn = $("save-btn");
  btn.disabled = true;
  btn.textContent = "저장 중...";
  try {
    const canvas = await html2canvas(screens.result, {
      backgroundColor: "#fdf8f2",
      scale: 2,
      useCORS: true
    });
    const link = document.createElement("a");
    link.download = `나의부모유형_${lastResult.animal.name.replace(/\s/g, "")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    btn.textContent = "저장 완료! ✓";
  } catch (e) {
    btn.textContent = "저장 실패 😢";
  }
  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = "📷 이미지로 저장";
  }, 2000);
});

$("share-btn").addEventListener("click", async () => {
  if (!lastResult) return;
  const a = lastResult.animal;
  const text = `[나는 어떤 부모인가?]\n나의 부모 유형: ${a.emoji} ${a.name} — ${a.title}\n${location.href}`;
  try {
    await navigator.clipboard.writeText(text);
    $("share-btn").textContent = "복사 완료! ✓";
    setTimeout(() => { $("share-btn").textContent = "결과 복사하기"; }, 2000);
  } catch {
    alert(text);
  }
});
