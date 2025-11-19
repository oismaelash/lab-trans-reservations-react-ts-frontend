/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_ADMIN_EMAILS?: string  // Emails separated by comma
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { 
            client_id: string; 
            callback: (response: { credential: string }) => void;
            locale?: string;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options?: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              width?: string | number;
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              locale?: string;
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              use_fedcm_for_prompt?: boolean;
            }
          ) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed?: boolean;
            isSkippedMoment?: boolean;
            isDismissedMoment?: boolean;
          }) => void) => void;
        };
      };
    };
  }
}

export {}

