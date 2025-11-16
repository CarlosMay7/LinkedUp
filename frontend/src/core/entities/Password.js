import { PASSWORD_CONSTRAINTS } from '../../config/constants';

export class Password {
    constructor(value) {
        this.value = value;
    }

    validate() {
        if (!this.value || this.value.trim() === '') {
            return 'Password is required';
        }
        if (this.value.length < PASSWORD_CONSTRAINTS.MIN_LENGTH) {
            return `Password must be at least ${PASSWORD_CONSTRAINTS.MIN_LENGTH} characters`;
        }
        return null;
    }

    isValid() {
        return this.validate() === null;
    }

    getValue() {
        return this.value;
    }
}

export class PasswordChange {
    constructor(currentPassword, newPassword) {
        this.currentPassword = new Password(currentPassword);
        this.newPassword = new Password(newPassword);
    }

    validate() {
        if (!this.currentPassword.getValue() || !this.newPassword.getValue()) {
            return 'Fill both password fields to change password';
        }

        const newPasswordError = this.newPassword.validate();
        if (newPasswordError) {
            return newPasswordError;
        }

        return null;
    }

    isValid() {
        return this.validate() === null;
    }

    getCurrentPassword() {
        return this.currentPassword.getValue();
    }

    getNewPassword() {
        return this.newPassword.getValue();
    }
}
