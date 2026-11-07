type FormErrors = Record<string, string[]>;
interface FormController {
    refresh(): void;
    destroy(): void;
}
interface RepeatableController {
    refresh(): void;
    destroy(): void;
}
interface ScopedFormOptions {
    root: Document | HTMLElement;
    afterSwap?(target: HTMLElement): void;
}
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
declare function initRepeatableGroup(root: HTMLElement): RepeatableController;
declare function initForm(formEl: HTMLFormElement): FormController;
/** Governed HTML form responses scoped to one selected application. */
declare function initScopedForm(formEl: HTMLFormElement, options: ScopedFormOptions): FormController;
declare const form: {
    name: string;
    init: typeof initForm;
};

export { type FormController, type FormErrors, type RepeatableController, type ScopedFormOptions, clearErrors, form, initForm, initRepeatableGroup, initScopedForm, registerAsyncRule, registerFieldAdapter, registerValidationMessage, showErrorSummary, showErrors, validateField, validateForm, validateFormAsync };
