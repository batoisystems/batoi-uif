type FormErrors = Record<string, string[]>;
type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type AsyncRuleHandler = (field: FormField, form: HTMLFormElement, signal: AbortSignal) => Promise<string[]>;
type FieldAdapter = (field: FormField) => string;
type ValidationMessageHandler = (field: FormField, rule: string, arg: string | undefined) => string;
declare function registerAsyncRule(name: string, handler: AsyncRuleHandler): void;
declare function registerFieldAdapter(name: string, adapter: FieldAdapter): void;
declare function registerValidationMessage(name: string, handler: ValidationMessageHandler): void;
declare function validateField(fieldEl: FormField): string[];
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

export { type FormErrors, clearErrors, form, initForm, initRepeatableGroup, registerAsyncRule, registerFieldAdapter, registerValidationMessage, showErrorSummary, showErrors, validateField, validateForm, validateFormAsync };
