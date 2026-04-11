import { ref } from 'vue'

// Module-level singleton — shared between HomeLayout and any page that needs
// to sync UI with the mobile nav's show/hide animation.
const _mobileNavVisible = ref(true)

export function useNavVisibility() {
  return { mobileNavVisible: _mobileNavVisible }
}
