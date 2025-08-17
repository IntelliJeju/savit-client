<template>
  <form @submit.prevent="$emit('submit')" class="space-y-5">
    <!-- 카드 등록 정보 섹션 -->
    <CardComponent>
      <div class="space-y-4">
        <div>
          <label for="organization" class="block text-sm font-bold text-slate-700 mb-2"
            >카드사</label
          >
          <select
            id="organization"
            :value="cardData.organization"
            @input="$emit('update:organization', ($event.target as HTMLSelectElement).value)"
            class="input-field border-b py-1 bg-white w-full"
            required
          >
            <option value="" disabled>카드사를 선택해주세요</option>
            <option v-for="card in organization" :key="card.code" :value="card.code">
              {{ card.name }}
            </option>
          </select>
        </div>

        <div>
          <label for="encryptedCardNo" class="block text-sm font-bold text-slate-700 mb-2"
            >카드 번호</label
          >
          <div class="grid grid-cols-4 gap-1">
            <input
              :value="cardNumber.part1"
              @input="$emit('cardNumberInput', 0, $event)"
              placeholder="1234"
              type="text"
              maxlength="4"
              class="w-full px-1 py-2 text-center text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
            <input
              :value="cardNumber.part2"
              @input="$emit('cardNumberInput', 1, $event)"
              placeholder="••••"
              type="password"
              maxlength="4"
              class="w-full px-1 py-2 text-center text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
            <input
              :value="cardNumber.part3"
              @input="$emit('cardNumberInput', 2, $event)"
              placeholder="••••"
              type="password"
              maxlength="4"
              class="w-full px-1 py-2 text-center text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
            <input
              :value="cardNumber.part4"
              @input="$emit('cardNumberInput', 3, $event)"
              placeholder="5678"
              type="text"
              maxlength="4"
              class="w-full px-1 py-2 text-center text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label for="cardPassword" class="block text-sm font-bold text-slate-700 mb-2"
            >카드 비밀번호 (앞 두자리)</label
          >
          <div class="flex items-center gap-1">
            <input
              :value="cardData.cardPassword"
              @input="$emit('passwordInput', $event)"
              placeholder="••"
              type="password"
              maxlength="2"
              class="w-16 px-1 py-2 text-center text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
            <span class="text-lg text-gray-400 font-bold">**</span>
          </div>
        </div>

        <div>
          <label for="loginId" class="block text-sm font-bold text-slate-700 mb-2"
            >사용자 ID</label
          >
          <InputField
            :model-value="cardData.loginId"
            @update:model-value="$emit('update:loginId', $event)"
            placeholder="카드사 사이트 로그인 ID"
            type="text"
          />
        </div>

        <div>
          <label for="loginPw" class="block text-sm font-bold text-slate-700 mb-2"
            >사용자 비밀번호</label
          >
          <InputField
            :model-value="cardData.loginPw"
            @update:model-value="$emit('update:loginPw', $event)"
            placeholder="카드사 사이트 로그인 비밀번호"
            type="password"
          />
        </div>

        <div>
          <label for="birthDate" class="block text-sm font-bold text-slate-700 mb-2"
            >생년월일</label
          >
          <InputField
            :model-value="cardData.birthDate"
            @update:model-value="$emit('update:birthDate', $event)"
            placeholder="YYYYMMDD (예: 20001225)"
            type="text"
            :maxlength="8"
          />
        </div>
      </div>
    </CardComponent>

    <!-- 등록 버튼 -->
    <div class="pb-4">
      <ButtonItem text="카드 등록하기" />
    </div>
  </form>
</template>

<script setup lang="ts">
import ButtonItem from '@/components/button/ButtonItem.vue'
import InputField from '@/components/input/InputField.vue'
import CardComponent from '@/components/card/CardComponent.vue'
import type { registerCardForm } from '@/types/card'
import type { CardNumberParts, CardOrganization, CardFormEvents } from '@/types/composables'

interface Props {
  cardData: registerCardForm
  cardNumber: CardNumberParts
  organization: CardOrganization[]
}

defineProps<Props>()
defineEmits<CardFormEvents>()
</script>