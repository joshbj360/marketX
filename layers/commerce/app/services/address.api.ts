import { BaseApiClient } from '~~/layers/core/app/services/base.api'

export interface ISavedAddress {
  id: number
  label?: string | null
  name: string
  address: string
  county: string
  state: string
  zipcode: string
  country: string
  phone: string
  isDefault: boolean
}

export interface ISaveAddressInput {
  label?: string
  name: string
  address: string
  county?: string
  state?: string
  zipcode?: string
  country: string
  phone?: string
  setAsDefault?: boolean
}

class AddressApiClient extends BaseApiClient {
  async getAddresses(): Promise<{ success: boolean; data: ISavedAddress[] }> {
    return this.request('/api/profile/addresses') as Promise<{
      success: boolean
      data: ISavedAddress[]
    }>
  }

  async saveAddress(
    input: ISaveAddressInput,
  ): Promise<{ success: boolean; data: ISavedAddress }> {
    return this.request('/api/profile/addresses', {
      method: 'POST',
      body: input,
    }) as Promise<{ success: boolean; data: ISavedAddress }>
  }

  async deleteAddress(id: number): Promise<{ success: boolean }> {
    return this.request(`/api/profile/addresses/${id}`, {
      method: 'DELETE',
    }) as Promise<{ success: boolean }>
  }

  async setDefaultAddress(id: number): Promise<{ success: boolean }> {
    return this.request(`/api/profile/addresses/${id}/default`, {
      method: 'PATCH',
    }) as Promise<{ success: boolean }>
  }
}

let _instance: AddressApiClient | null = null
export const useAddressApi = () => {
  if (!_instance) _instance = new AddressApiClient()
  return _instance
}
