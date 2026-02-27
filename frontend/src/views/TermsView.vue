<template>
  <div class="terms-page">
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <div class="text-center mb-8">
            <h1 
              class="text-h3 font-weight-bold mb-4"
              :class="accessibilityStore.fontSizeClass"
            >
              이용약관
            </h1>
            <p 
              class="text-h6 text-grey-darken-1"
              :class="accessibilityStore.fontSizeClass"
            >
              Traveller 서비스 이용에 관한 약관입니다
            </p>
            <v-divider class="my-6"></v-divider>
            <p class="text-body-2 text-grey">
              최종 업데이트: 2024년 1월 1일 | 시행일: 2024년 1월 1일
            </p>
          </div>

          <v-card 
            class="terms-content pa-6"
            :class="{ 'high-contrast-card': accessibilityStore.highContrast }"
            elevation="2"
          >
            <div class="terms-text" :class="accessibilityStore.fontSizeClass">
              
              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제1조 (목적)</h2>
                <p class="mb-4">
                  이 약관은 Traveller(이하 "회사")가 제공하는 배리어프리 여행 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 
                  회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제2조 (정의)</h2>
                <p class="mb-2">이 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
                <ol class="ml-6">
                  <li class="mb-2">"서비스"란 회사가 제공하는 배리어프리 여행 정보, 동행 매칭, 커뮤니티 등의 온라인 서비스를 말합니다.</li>
                  <li class="mb-2">"회원"이란 회사의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                  <li class="mb-2">"이용자"란 회원 및 비회원을 포함하여 서비스를 이용하는 모든 자를 말합니다.</li>
                  <li class="mb-2">"동행 서비스"란 여행 동행을 원하는 회원들을 연결해주는 매칭 서비스를 말합니다.</li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제3조 (약관의 효력 및 변경)</h2>
                <ol class="ml-6">
                  <li class="mb-2">이 약관은 서비스를 이용하는 모든 이용자에게 그 효력이 발생합니다.</li>
                  <li class="mb-2">회사는 필요에 따라 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.</li>
                  <li class="mb-2">변경된 약관에 대해 이용자가 거부의사를 표시하지 않는 경우 약관의 변경에 동의한 것으로 간주합니다.</li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제4조 (회원가입 및 이용계약의 성립)</h2>
                <ol class="ml-6">
                  <li class="mb-2">회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입 신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
                  <li class="mb-2">회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:
                    <ul class="ml-4 mt-2">
                      <li>타인의 명의를 이용하여 신청한 경우</li>
                      <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                      <li>관련 법령에 위배되는 목적으로 신청한 경우</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제5조 (서비스의 제공)</h2>
                <ol class="ml-6">
                  <li class="mb-2">회사는 다음과 같은 서비스를 제공합니다:
                    <ul class="ml-4 mt-2">
                      <li>배리어프리 여행지 정보 제공</li>
                      <li>접근성 시설 정보 및 평가</li>
                      <li>AI 기반 동행 매칭 서비스</li>
                      <li>여행 커뮤니티 및 정보 공유</li>
                      <li>기타 여행 관련 부가 서비스</li>
                    </ul>
                  </li>
                  <li class="mb-2">서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다. 단, 시스템 점검 등의 사유로 서비스가 중단될 수 있습니다.</li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제6조 (동행 서비스 이용)</h2>
                <ol class="ml-6">
                  <li class="mb-2">동행 서비스는 여행 동행을 원하는 회원들 간의 연결을 위한 플랫폼 역할만을 제공합니다.</li>
                  <li class="mb-2">실제 동행 관계에서 발생하는 모든 책임은 당사자들에게 있으며, 회사는 이에 대한 책임을 지지 않습니다.</li>
                  <li class="mb-2">회원은 동행 과정에서 상대방의 개인정보를 보호해야 하며, 부적절한 행위를 금지합니다.</li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제7조 (회원의 의무)</h2>
                <ol class="ml-6">
                  <li class="mb-2">회원은 다음 행위를 해서는 안 됩니다:
                    <ul class="ml-4 mt-2">
                      <li>신청 또는 변경 시 허위내용의 등록</li>
                      <li>타인의 정보 도용</li>
                      <li>회사가 게시한 정보의 변경</li>
                      <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                      <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                      <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제8조 (개인정보보호)</h2>
                <p class="mb-4">
                  회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 
                  개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
                </p>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제9조 (회사의 면책)</h2>
                <ol class="ml-6">
                  <li class="mb-2">회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                  <li class="mb-2">회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
                  <li class="mb-2">회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제10조 (분쟁해결)</h2>
                <ol class="ml-6">
                  <li class="mb-2">이 약관에 명시되지 않은 사항에 대해서는 관련 법령 또는 상관례에 따릅니다.</li>
                  <li class="mb-2">서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.</li>
                </ol>
              </section>

              <section class="mb-8">
                <h2 class="text-h5 font-weight-bold mb-4">제11조 (접근성 서비스)</h2>
                <ol class="ml-6">
                  <li class="mb-2">회사는 장애인 등의 정보 접근 및 이용 편의를 위해 접근성 기능을 제공합니다.</li>
                  <li class="mb-2">접근성 기능에는 화면 확대, 고대비 모드, 키보드 내비게이션 등이 포함됩니다.</li>
                  <li class="mb-2">접근성 관련 문의는 고객센터를 통해 접수할 수 있습니다.</li>
                </ol>
              </section>

              <v-divider class="my-6"></v-divider>
              
              <div class="text-center">
                <p class="text-body-2 text-grey mb-4">
                  문의사항이 있으시면 언제든지 연락주세요.
                </p>
                <v-btn 
                  color="primary" 
                  variant="outlined"
                  to="/contact"
                  prepend-icon="mdi-email"
                >
                  문의하기
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
.terms-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.terms-content {
  background-color: #fff;
}

.terms-text {
  line-height: 1.8;
}

.terms-text h2 {
  border-bottom: 2px solid #1976D2;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.terms-text ol, .terms-text ul {
  line-height: 1.6;
}

.terms-text li {
  margin-bottom: 0.5rem;
}

.high-contrast-card {
  background-color: #000 !important;
  color: #fff !important;
  border: 2px solid #fff;
}

.high-contrast .terms-page {
  background-color: #000;
}

.high-contrast .terms-text h2 {
  border-bottom-color: #fff;
}

@media (max-width: 960px) {
  .terms-content {
    padding: 1rem !important;
  }
  
  .terms-text {
    font-size: 0.9rem;
  }
}
</style>