import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from '@/lib/theme-constants'

const script = `(function(){try{var t=null;var m=document.cookie.match(/(?:^|; )${THEME_COOKIE_NAME}=([^;]*)/);if(m&&m[1]){t=decodeURIComponent(m[1]);}if(!t){t=window.localStorage.getItem('${THEME_STORAGE_KEY}');}if(t!=='light'&&t!=='dark'&&t!=='system'){t='system';}var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var root=document.documentElement;if(r==='dark'){root.classList.add('dark');}else{root.classList.remove('dark');}root.setAttribute('data-theme',t);root.style.colorScheme=r;}catch(e){}})();`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
