import Cookies from 'js-cookie';
import type { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { httpPost } from '../../lib/http';
import { TOKEN_COOKIE_NAME } from '../../lib/jwt';
import { t } from '../../helpers/translate';

const EmailLoginForm: FunctionComponent<{}> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { response, error } = await httpPost<{ token: string }>(
      `${import.meta.env.PUBLIC_API_URL}/v1-login`,
      {
        email,
        password,
      }
    );

    // Log the user in and reload the page
    if (response?.token) {
      Cookies.set(TOKEN_COOKIE_NAME, response.token, {
        path: '/',
        expires: 30,
      });
      window.location.reload();

      return;
    }

    // @todo use proper types
    if ((error as any).type === 'user_not_verified') {
      window.location.href = `/verification-pending?email=${encodeURIComponent(
        email
      )}`;
      return;
    }

    setIsLoading(false);
    setError(error?.message || 'Something went wrong. Please try again later.');
  };

  return (
    <form className="w-full" onSubmit={handleFormSubmit}>
      <label htmlFor="email" className="sr-only">
        {t('emailAddress')}
      </label>
      <input
        name="email"
        type="email"
        autoComplete="email"
        required
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
        placeholder="Email Address"
        value={email}
        onInput={(e) => setEmail(String((e.target as any).value))}
      />
      <label htmlFor="password" className="sr-only">
        {t('password')}
      </label>
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="Password"
        className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
        value={password}
        onInput={(e) => setPassword(String((e.target as any).value))}
      />

      <p class="mb-3 mt-2 text-sm text-gray-500">
        <a
          href="/forgot-password"
          className="text-blue-800 hover:text-blue-600"
        >
          {t('loginResetPassword')}
        </a>
      </p>

      {error && (
        <p className="mb-2 rounded-md bg-red-100 p-2 text-red-800">
          {t(error)}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-black p-2 py-3 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 disabled:bg-gray-400"
      >
        {isLoading ? t('pleaseWait') : t('continue')}
      </button>
    </form>
  );
};

export default EmailLoginForm;
