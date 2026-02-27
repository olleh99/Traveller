<template>
  <div class="privacy-page">
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="text-center mb-8">
            <h1 
              class="text-h3 font-weight-bold mb-4"
              :class="accessibilityStore.fontSizeClass"
            >
              개인정보처리방침
            </h1>
            <p 
              class="text-h6 text-grey-darken-1"
              :class="accessibilityStore.fontSizeClass"
            >
              Traveller의 개인정보 수집, 이용, 보관에 관한 방침입니다
            </p>
            <v-divider class="my-6"></v-divider>
            <p class="text-body-2 text-grey">
              최종 업데이트: 2024년 1월 1일 | 시행일: 2024년 1월 1일
            </p>
          </div>

          <v-card 
            class="privacy-content pa-6"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
            elevation="2"
          >
            <div class="privacy-text" :class="accessibilityStore.fontSizeClass">
              
              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">1. 개인정보 처리방침의 목적</h2>
                <p class="mb-4">
                  Traveller(이하 "회사")는 개인정보보호법 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                </p>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">2. 개인정보의 처리 목적</h2>
                <p class="mb-4">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                
                <h3 class="text-h6 font-weight-bold mb-3">가. 회원가입 및 관리</h3>
                <ul class="ml-6 mb-4">
                  <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                  <li>회원자격 유지·관리, 서비스 부정이용 방지</li>
                  <li>각종 고지·통지, 고충처리 목적</li>
                </ul>

                <h3 class="text-h6 font-weight-bold mb-3">나. 배리어프리 여행 서비스 제공</h3>
                <ul class="ml-6 mb-4">
                  <li>맞춤형 여행지 추천 및 정보 제공</li>
                  <li>접근성 정보 및 시설 안내</li>
                  <li>여행 계획 수립 지원</li>
                </ul>

                <h3 class="text-h6 font-weight-bold mb-3">다. 동행 매칭 서비스</h3>
                <ul class="ml-6 mb-4">
                  <li>동행자 매칭 및 추천</li>
                  <li>매칭 품질 향상을 위한 선호도 분석</li>
                  <li>안전한 동행 환경 조성</li>
                </ul>

                <h3 class="text-h6 font-weight-bold mb-3">라. 마케팅 및 광고에의 활용</h3>
                <ul class="ml-6 mb-4">
                  <li>신규 서비스 개발 및 맞춤 서비스 제공</li>
                  <li>이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
                  <li>인구통계학적 특성에 따른 서비스 제공 및 광고 게재</li>
                </ul>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">3. 개인정보의 수집 항목 및 방법</h2>
                
                <h3 class="text-h6 font-weight-bold mb-3">가. 수집하는 개인정보 항목</h3>
                
                <h4 class="text-subtitle-1 font-weight-bold mb-2">필수항목</h4>
                <ul class="ml-6 mb-4">
                  <li>일반회원: 이름, 이메일주소, 비밀번호, 휴대전화번호</li>
                  <li>장애인 여행자: 장애 유형, 보조기구 사용 여부, 동행 필요 정도</li>
                  <li>동행 지원자: 자격증명서류, 경력사항, 자기소개</li>
                </ul>

                <h4 class="text-subtitle-1 font-weight-bold mb-2">선택항목</h4>
                <ul class="ml-6 mb-4">
                  <li>프로필 사진, 생년월일, 성별, 주소</li>
                  <li>여행 선호도, 관심 지역, 취미 및 특기</li>
                  <li>비상연락처, SNS 계정 정보</li>
                </ul>

                <h4 class="text-subtitle-1 font-weight-bold mb-2">자동 수집 정보</h4>
                <ul class="ml-6 mb-4">
                  <li>IP주소, 쿠키, MAC주소, 서비스 이용기록</li>
                  <li>접속 로그, 접속 기기 정보</li>
                </ul>

                <h3 class="text-h6 font-weight-bold mb-3">나. 개인정보 수집 방법</h3>
                <ul class="ml-6 mb-4">
                  <li>홈페이지, 서면양식, 팩스, 전화, 상담게시판, 이메일</li>
                  <li>협력회사로부터의 제공</li>
                  <li>생성정보 수집 툴을 통한 수집</li>
                </ul>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">4. 개인정보의 처리 및 보유기간</h2>
                <ol class="ml-6 mb-4">
                  <li class="mb-2">회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
                  <li class="mb-2">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
                    <ul class="ml-4 mt-2">
                      <li><strong>회원가입 및 관리:</strong> 회원탈퇴 즉시 파기 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료시까지)</li>
                      <li><strong>서비스 제공:</strong> 서비스 이용계약 종료시까지</li>
                      <li><strong>동행 매칭 서비스:</strong> 매칭 완료 후 1년</li>
                      <li><strong>부정이용 방지:</strong> 1년</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">5. 개인정보의 제3자 제공</h2>
                <ol class="ml-6 mb-4">
                  <li class="mb-2">회사는 정보주체의 개인정보를 제2조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</li>
                  <li class="mb-2">회사는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다:
                    <ul class="ml-4 mt-2">
                      <li><strong>동행 매칭 서비스:</strong> 매칭이 성사된 경우 당사자 간 필요 최소한의 연락처 정보 제공</li>
                      <li><strong>법령상 의무:</strong> 수사기관의 수사목적으로 법령에 정해진 절차와 방법에 따라 요청이 있는 경우</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">6. 개인정보처리의 위탁</h2>
                <ol class="ml-6 mb-4">
                  <li class="mb-2">회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</li>
                </ol>
                
                <v-table density="compact" class="mb-4">
                  <thead>
                    <tr>
                      <th>위탁받는 자</th>
                      <th>위탁하는 업무의 내용</th>
                      <th>개인정보의 보유 및 이용기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>AWS</td>
                      <td>클라우드 서버 운영 및 관리</td>
                      <td>위탁계약 종료시까지</td>
                    </tr>
                    <tr>
                      <td>문자 발송 업체</td>
                      <td>회원가입 인증 및 알림 문자 발송</td>
                      <td>발송 완료 즉시</td>
                    </tr>
                  </tbody>
                </v-table>

                <p class="mb-4">
                  회사는 위탁계약 체결시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
                </p>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">7. 정보주체의 권리·의무 및 행사방법</h2>
                <ol class="ml-6 mb-4">
                  <li class="mb-2">정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
                    <ul class="ml-4 mt-2">
                      <li>개인정보 처리현황 통지요구</li>
                      <li>개인정보 열람요구</li>
                      <li>개인정보 정정·삭제요구</li>
                      <li>개인정보 처리정지요구</li>
                    </ul>
                  </li>
                  <li class="mb-2">제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.</li>
                  <li class="mb-2">정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">8. 개인정보의 안전성 확보조치</h2>
                <p class="mb-4">회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:</p>
                <ol class="ml-6 mb-4">
                  <li class="mb-2"><strong>개인정보 취급 직원의 최소화 및 교육:</strong> 개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화하여 개인정보를 관리하는 대책을 시행하고 있습니다.</li>
                  <li class="mb-2"><strong>정기적인 자체 감사:</strong> 개인정보 취급 관련 안정성 확보를 위해 정기적(분기 1회)으로 자체 감사를 실시하고 있습니다.</li>
                  <li class="mb-2"><strong>개인정보의 암호화:</strong> 이용자의 개인정보는 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며 중요한 데이터는 파일 및 전송 데이터를 암호화하거나 파일 잠금 기능을 사용하는 등의 별도 보안기능을 사용하고 있습니다.</li>
                  <li class="mb-2"><strong>해킹 등에 대비한 기술적 대책:</strong> 회사는 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</li>
                  <li class="mb-2"><strong>개인정보에 대한 접근 제한:</strong> 개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여,변경,말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있으며 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있습니다.</li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">9. 개인정보보호책임자</h2>
                <p class="mb-4">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.</p>
                
                <v-card variant="outlined" class="pa-4 mb-4">
                  <h4 class="text-h6 font-weight-bold mb-2">▶ 개인정보보호책임자</h4>
                  <ul class="ml-4">
                    <li>성명: 홍길동</li>
                    <li>직책: 개발팀장</li>
                    <li>연락처: privacy@traveller.com</li>
                    <li>전화번호: 02-1234-5678</li>
                  </ul>
                </v-card>
                
                <p class="mb-4">※ 개인정보보호 담당부서로 연결됩니다.</p>
                <p class="mb-4">정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보보호책임자 및 담당부서로 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체없이 답변 및 처리해드릴 것입니다.</p>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">10. 개인정보 처리방침 변경</h2>
                <ol class="ml-6 mb-4">
                  <li class="mb-2">이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</li>
                  <li class="mb-2">이전 개인정보 처리방침은 아래에서 확인하실 수 있습니다.</li>
                </ol>
              </section>

              <v-divider class="my-6"></v-divider>
              
              <div class="text-center">
                <p class="text-body-2 text-grey mb-4">
                  개인정보 처리에 관한 문의사항이 있으시면 언제든지 연락주세요.
                </p>
                <v-btn 
                  color="primary" 
                  variant="outlined"
                  href="mailto:privacy@traveller.com"
                  prepend-icon="mdi-email"
                >
                  개인정보 문의하기
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useAccessibilityStore } from '@/stores/accessibility'

const accessibilityStore = useAccessibilityStore()
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.privacy-content {
  background-color: #fff;
}

.privacy-text {
  line-height: 1.8;
}

.privacy-text h2 {
  border-bottom: 2px solid #1976D2;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.privacy-text h3 {
  color: #1976D2;
  margin-top: 1rem;
}

.privacy-text h4 {
  color: #424242;
  margin-top: 0.8rem;
}

.privacy-text ol, .privacy-text ul {
  line-height: 1.6;
}

.privacy-text li {
  margin-bottom: 0.5rem;
}

.privacy-text table {
  border-collapse: collapse;
  margin: 1rem 0;
}

.privacy-text th,
.privacy-text td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

.privacy-text th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.high-contrast-card {
  background-color: #000 !important;
  color: #fff !important;
  border: 2px solid #fff;
}

.high-contrast .privacy-page {
  background-color: #000;
}

.high-contrast .privacy-text h2 {
  border-bottom-color: #fff;
}

.high-contrast .privacy-text h3 {
  color: #fff;
}

.high-contrast .privacy-text h4 {
  color: #ccc;
}

.high-contrast .privacy-text th {
  background-color: #333 !important;
  color: #fff !important;
}

.high-contrast .privacy-text td {
  border-color: #555;
}

@media (max-width: 960px) {
  .privacy-content {
    padding: 1rem !important;
  }
  
  .privacy-text {
    font-size: 0.9rem;
  }
  
  .privacy-text table {
    font-size: 0.8rem;
  }
}
</style>