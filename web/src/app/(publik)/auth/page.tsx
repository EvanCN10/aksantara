export const AuthPage = () => {
  return (
    <main>
      <h1>Masuk ke Aksantara</h1>
      <p>Pilih peran Anda untuk melanjutkan sesi pembelajaran.</p>
      <form>
        <fieldset>
          <legend>Pilih Peran</legend>
          <label>
            <input type="radio" name="role" value="siswa" defaultChecked />
            Siswa
          </label>
          <label>
            <input type="radio" name="role" value="guru" />
            Guru
          </label>
        </fieldset>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">Kata Sandi</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Masuk</button>
      </form>
    </main>
  );
};

export default AuthPage;
