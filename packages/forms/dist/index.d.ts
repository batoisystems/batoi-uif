type FormErrors = Record<string, string[]>;
type AsyncRuleHandler = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, form: HTMLFormElement) => Promise<string[]>;
declare function registerAsyncRule(name: string, handler: AsyncRuleHandler): void;
declare function validateField(fieldEl: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string[];
declare function validateForm(formEl: HTMLFormElement): FormErrors;
declare function clearErrors(formEl: HTMLFormElement): void;
declare function showErrors(formEl: HTMLFormElement, errors: FormErrors): void;
declare function showErrorSummary(formEl: HTMLFormElement, errors: FormErrors): HTMLElement | null;
declare function validateFormAsync(formEl: HTMLFormElement): Promise<FormErrors>;
declare function initRepeatableGroup(root: HTMLElement): void;
declare function initForm(formEl: HTMLFormElement): void;
declare const form: {
    name: string;
    init: typeof initForm;
};

export { type FormErrors, clearErrors, form, initForm, initRepeatableGroup, registerAsyncRule, showErrorSummary, showErrors, validateField, validateForm, validateFormAsync };
