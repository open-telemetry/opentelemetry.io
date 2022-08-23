$(function () {
  const key = 'linux-foundation-org-cookie-consent';
  const consentValue = 'true'

  if (Cookies.get(key) === consentValue) { return; }

  $('#privacyNotice')
    .on('hide.bs.modal', function () {
      Cookies.set(key, consentValue, { sameSite: 'strict', expires: 90 });
    })
    .modal('show');
});
