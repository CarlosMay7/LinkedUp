import { USER_ROLES } from '../../config/constants';

export class Role {
    static STUDENT = USER_ROLES.STUDENT;
    static PROFESSOR = USER_ROLES.PROFESSOR;
    static ADMIN = USER_ROLES.ADMIN;

    static values = [Role.STUDENT, Role.PROFESSOR, Role.ADMIN];

    constructor(value) {
        if (!Role.isValid(value)) {
            throw new Error(
                `Invalid role: ${value}. Must be one of: ${Role.values.join(', ')}`
            );
        }
        this.value = value;
    }

    static isValid(value) {
        return Role.values.includes(value);
    }

    getValue() {
        return this.value;
    }

    getDisplayName() {
        return this.value.charAt(0).toUpperCase() + this.value.slice(1);
    }

    isStudent() {
        return this.value === Role.STUDENT;
    }

    isProfessor() {
        return this.value === Role.PROFESSOR;
    }

    isAdmin() {
        return this.value === Role.ADMIN;
    }
}
