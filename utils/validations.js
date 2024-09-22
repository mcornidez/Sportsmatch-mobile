function validateEmail(mail) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    mail
  );
}

const getEmailValidator = () => {
  return '/^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*';
}

function matching(pass1, pass2) {
  return pass1 === pass2;
}

function isEmpty(input) {
  return input === "";
}

function validatePhoneNumber(number) {
  return /^[0-9]{8}$/.test(number);
}

function validatePassword(password) {
  return /^(?=.[a-z])(?=.[A-Z])(?=.\\d)(?=.\\W).{8,}$/.test(password);
}

export { validateEmail, matching, isEmpty, validatePhoneNumber, validatePassword, getEmailValidator };