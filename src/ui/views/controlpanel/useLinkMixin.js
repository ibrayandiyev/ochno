import { useRoute, useRouter } from 'vue-router';

export default function useLinkMixin() {
  const route = useRoute();
  const router = useRouter();

  return {
    openLink(href) {
      const link = href.replace(new RegExp(`^${window.location.origin}${window.location.pathname}`), '');

      if (link.startsWith('@')) {
        const queryParams = new URLSearchParams(link.substring(1));
        router.push({ query: { ...route.query, ...Object.fromEntries(queryParams) } })
          .catch(() => {}); // Catch is necessary to avoid error messages.
      } else {
        window.open(link);
      }
    },
  };
}
