import { Dialog, Tabs, Alert, Field, Input, Button, Badge, type Color } from '@economic/taco';
import type { Employee, EmployeeStatus } from '../../data/mockEmployees';
import { da } from '../../data/danishCopy';

type Props = {
    employee: Employee | null;
    onClose: () => void;
};

const STATUS_COLOR: Record<EmployeeStatus, Color> = {
    pending: 'orange',
    active: 'green',
    resigned: 'grey',
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
    pending: da.status.pending,
    active: da.status.active,
    resigned: da.status.resigned,
};

const HIGHLIGHT = 'bg-yellow-100';

function HighlightedInput({
    highlighted,
    defaultValue,
    placeholder,
}: {
    highlighted: boolean;
    defaultValue?: string;
    placeholder?: string;
}) {
    return (
        <Input
            defaultValue={defaultValue ?? ''}
            placeholder={placeholder}
            className={highlighted ? HIGHLIGHT : undefined}
        />
    );
}

function TabPlaceholder() {
    return (
        <div className="py-12 text-sm text-neutral-500 text-center">
            {da.editDialog.tabPlaceholder}
        </div>
    );
}

export function EmployeeEditDialog({ employee, onClose }: Props) {
    const open = !!employee;
    const t = da.editDialog;
    const f = t.fields;

    // Which fields we treat as "extracted from the uploaded document".
    // (Empty fields like email/address/phone weren't in the upload.)
    const extracted = {
        cpr: true,
        fullName: true,
        country: false,
        employeeGroup: false,
        employmentDate: true,
        employeeNumber: true,
        salary: true,
        department: true,
        payPeriod: true,
    };

    return (
        <Dialog
            open={open}
            onChange={(next) => {
                if (!next) onClose();
            }}
            size="lg"
        >
            <Dialog.Content aria-label={employee?.name ?? 'Edit employee'}>
                <Dialog.Title>
                    <span className="inline-flex items-center gap-2">
                        <span>{employee?.name ?? ''}</span>
                        {employee && (
                            <Badge color={STATUS_COLOR[employee.status]} subtle>
                                {STATUS_LABEL[employee.status]}
                            </Badge>
                        )}
                    </span>
                </Dialog.Title>

                <Tabs defaultId="general">
                    <Tabs.List>
                        <Tabs.Trigger id="general">{t.tabs.personalInfo}</Tabs.Trigger>
                        <Tabs.Trigger id="financial">{t.tabs.employment}</Tabs.Trigger>
                        <Tabs.Trigger id="vacation">{t.tabs.vacation}</Tabs.Trigger>
                        <Tabs.Trigger id="salary">{t.tabs.salary}</Tabs.Trigger>
                        <Tabs.Trigger id="pension">{t.tabs.pension}</Tabs.Trigger>
                        <Tabs.Trigger id="options">{t.tabs.options}</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content id="general">
                        <div className="flex flex-col gap-4 pt-4">
                            <Alert state="information" title={t.alertTitle}>
                                {t.alertBody}
                            </Alert>

                            <h3 className="text-sm font-bold text-neutral-900 mt-2">
                                {t.sectionGeneral}
                            </h3>

                            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                                <div className="flex flex-col gap-4">
                                    <Field>
                                        <span className="text-xs font-bold">
                                            {f.cpr}*
                                        </span>
                                        <div className="flex gap-2 items-start">
                                            <HighlightedInput
                                                highlighted={extracted.cpr}
                                                defaultValue={employee?.cpr}
                                            />
                                            <Button appearance="default">
                                                {f.fetchCpr}
                                            </Button>
                                        </div>
                                    </Field>

                                    <Field>
                                        <span className="text-xs font-bold">
                                            {f.fullName}*
                                        </span>
                                        <HighlightedInput
                                            highlighted={extracted.fullName}
                                            defaultValue={employee?.name}
                                        />
                                    </Field>

                                    <Field>
                                        <span className="text-xs font-bold">{f.co}</span>
                                        <HighlightedInput highlighted={false} />
                                    </Field>

                                    <div className="grid grid-cols-[110px_1fr] gap-2">
                                        <Field>
                                            <span className="text-xs font-bold">
                                                {f.postCode}*
                                            </span>
                                            <HighlightedInput highlighted={false} />
                                        </Field>
                                        <Field>
                                            <span className="text-xs font-bold">
                                                {f.city}*
                                            </span>
                                            <HighlightedInput highlighted={false} />
                                        </Field>
                                    </div>

                                    <Field>
                                        <span className="text-xs font-bold">
                                            {f.address}*
                                        </span>
                                        <HighlightedInput highlighted={false} />
                                    </Field>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Field>
                                        <span className="text-xs font-bold">
                                            {f.country}*
                                        </span>
                                        <HighlightedInput
                                            highlighted={extracted.country}
                                            defaultValue={t.defaults.country}
                                        />
                                    </Field>

                                    <Field>
                                        <span className="text-xs font-bold">{f.email}</span>
                                        <HighlightedInput highlighted={false} />
                                    </Field>

                                    <Field>
                                        <span className="text-xs font-bold">
                                            {f.phone}
                                        </span>
                                        <HighlightedInput highlighted={false} />
                                    </Field>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Field>
                                        <span className="text-xs font-bold">
                                            {f.employeeGroup}
                                        </span>
                                        <HighlightedInput
                                            highlighted={extracted.employeeGroup}
                                            defaultValue={t.defaults.employeeGroup}
                                        />
                                    </Field>

                                    <div className="grid grid-cols-[1fr_1fr] gap-2">
                                        <Field>
                                            <span className="text-xs font-bold">
                                                {f.employmentDate}*
                                            </span>
                                            <HighlightedInput
                                                highlighted={extracted.employmentDate}
                                                defaultValue={employee?.hireDate}
                                            />
                                        </Field>
                                        <Field>
                                            <span className="text-xs font-bold">
                                                {f.employeeNumber}*
                                            </span>
                                            <HighlightedInput
                                                highlighted={extracted.employeeNumber}
                                                defaultValue={employee?.employeeNumber}
                                            />
                                        </Field>
                                    </div>

                                    <Field>
                                        <span className="text-xs font-bold">
                                            {f.department}
                                        </span>
                                        <HighlightedInput
                                            highlighted={extracted.department}
                                            defaultValue={employee?.department}
                                        />
                                    </Field>

                                    <Field>
                                        <span className="text-xs font-bold">
                                            {f.payPeriod}
                                        </span>
                                        <HighlightedInput
                                            highlighted={extracted.payPeriod}
                                            defaultValue={employee?.payPeriod}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </Tabs.Content>

                    <Tabs.Content id="financial"><TabPlaceholder /></Tabs.Content>
                    <Tabs.Content id="vacation"><TabPlaceholder /></Tabs.Content>
                    <Tabs.Content id="salary"><TabPlaceholder /></Tabs.Content>
                    <Tabs.Content id="pension"><TabPlaceholder /></Tabs.Content>
                    <Tabs.Content id="options"><TabPlaceholder /></Tabs.Content>
                </Tabs>

                <Dialog.Footer>
                    <Button appearance="default" onClick={onClose}>
                        {t.actions.cancel}
                    </Button>
                    <Button appearance="primary" onClick={onClose}>
                        {t.actions.save}
                    </Button>
                    <Button appearance="default" onClick={onClose}>
                        {t.actions.saveNext}
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
