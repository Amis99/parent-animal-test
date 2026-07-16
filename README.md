# 나는 어떤 부모인가? 🦁🐬🦉

36가지 동물 유형으로 알아보는 학부모 양육 유형 테스트입니다.
프레임워크 없이 HTML/CSS/JavaScript만 사용한 정적 사이트로, GitHub Pages에 바로 배포할 수 있습니다.

## 판정 방식

- **4개 성향 축**: 공감↔분석 / 자율↔지도 / 밀착↔관망 / 도전↔안정
- **20개 상황 질문**: 위(A)·아래(B) 두 선택지 사이에서 슬라이더로 "어느 쪽에 얼마나 가까운지"를 답합니다.
- 각 선택지에는 축별 벡터값이 정의되어 있고(`data.js`의 `va`, `vb`), 슬라이더 위치가 두 벡터의 가중치가 되어 4차원 성향 벡터에 누적됩니다.
- 최종 벡터를 정규화한 뒤, 36가지 동물 유형의 좌표(2×3×3×2 조합)와 **유클리드 거리**를 계산해 가장 가까운 동물로 판정합니다.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 화면 구조 (시작 / 질문 / 결과) |
| `style.css` | 스타일 |
| `data.js` | 질문 20개 + 동물 36종 데이터 (질문·유형 수정은 이 파일만 고치면 됨) |
| `app.js` | 슬라이더 UI, 벡터 계산, 판정 로직 |

## GitHub Pages 배포 방법

1. GitHub에서 새 저장소를 만듭니다. (예: `parent-animal-test`)
2. 이 폴더에서 아래 명령을 실행합니다.
   ```bash
   git remote add origin https://github.com/<내계정>/parent-animal-test.git
   git push -u origin main
   ```
3. GitHub 저장소 → **Settings → Pages** 로 이동합니다.
4. **Source**를 `Deploy from a branch`, Branch를 `main` / `/(root)`로 설정하고 저장합니다.
5. 1~2분 후 `https://<내계정>.github.io/parent-animal-test/` 에서 접속할 수 있습니다.

## 커스터마이징

- **동물 그림 교체**: 현재는 이모지를 사용합니다. 실제 일러스트를 쓰려면 `data.js`의 `emoji` 필드를 이미지 경로로 바꾸고, `app.js`의 `result-emoji` 부분을 `<img>` 태그로 수정하세요.
- **질문 수정**: `data.js`의 `QUESTIONS` 배열에서 문항과 벡터값(`va`, `vb`)을 조정하면 됩니다. 각 축의 균형이 깨지지 않도록 축별 전담 질문 수(현재 5개씩)를 유지하는 것을 권장합니다.
