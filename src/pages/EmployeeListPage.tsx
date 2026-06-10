import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Heading, Menu, Icon } from '@economic/taco';
import { EmptyState } from '../features/employee-onboarding/EmptyState';
import { EmployeeDraftsTable } from '../features/employee-onboarding/EmployeeDraftsTable';
import { ImportDialog } from '../features/employee-onboarding/ImportDialog';
import { mockEmployees, type Employee } from '../data/mockEmployees';
import {
    setEmployees as setStoreEmployees,
    useEmployees,
} from '../store/employeesStore';
import { da } from '../data/danishCopy';
import { useVariantPaths } from '../paths';
import { EmployeeEditDialogV2 } from '../features/employee-onboarding/EmployeeEditDialogV2';
import { EmployeeEditDialogScheduleV1 } from '../features/employee-onboarding/EmployeeEditDialogScheduleV1';

type DemoState = 'empty' | 'processed';

type Props = {
    editMode?: 'page' | 'modal' | 'schedule';
};

export function EmployeeListPage({ editMode = 'page' }: Props = {}) {
    const isModalMode = editMode === 'modal' || editMode === 'schedule';
    const variantPaths = useVariantPaths();
    const [searchParams, setSearchParams] = useSearchParams();
    const stateParam = searchParams.get('state') as DemoState | null;
    const initialState: DemoState =
        stateParam === 'processed' ? 'processed' : 'empty';

    const [demoState, setDemoState] = useState<DemoState>(initialState);
    const employees = useEmployees();
    const [importOpen, setImportOpen] = useState(false);
    const navigate = useNavigate();

    const [modalEmployee, setModalEmployee] = useState<Employee | null>(null);
    const [editPenEmployee, setEditPenEmployee] = useState<Employee | null>(null);
    const [reviewEmployee, setReviewEmployee] = useState<Employee | null>(null);

    const handleImportProcessed = () => {
        setDemoState('processed');
    };

    const handleRowClick = (employee: Employee) => {
        if (isModalMode) {
            setModalEmployee(employee);
        } else {
            navigate(variantPaths.employee(employee.id));
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <Heading level={1}>{da.page.title}</Heading>
            </div>

            {demoState === 'empty' ? (
                <div className="flex flex-col items-center gap-6 pt-8">
                    <EmptyState />
                    <div className="flex gap-3">
                        <Button appearance="default">
                            {da.actions.createManually}
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={() => setImportOpen(true)}
                        >
                            {da.actions.quickCreate}
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <Button appearance="primary">
                            {da.actions.addEmployee}
                        </Button>
                        <Button
                            appearance="default"
                            menu={(props) => (
                                <Menu {...props}>
                                    <Menu.Content>
                                        <Menu.Item
                                            onClick={() => setImportOpen(true)}
                                        >
                                            <span className="inline-flex items-center justify-between gap-3 w-full">
                                                <span>{da.actions.quickCreate}</span>
                                                <Icon name="import" />
                                            </span>
                                        </Menu.Item>
                                        <Menu.Item disabled>
                                            {da.actions.morePlaceholder}
                                        </Menu.Item>
                                    </Menu.Content>
                                </Menu>
                            )}
                        >
                            {da.actions.more}
                        </Button>
                    </div>

                    <EmployeeDraftsTable
                        employees={employees}
                        onRowClick={handleRowClick}
                        onEditClick={setEditPenEmployee}
                        onReviewClick={setReviewEmployee}
                    />
                </>
            )}

            <ImportDialog
                open={importOpen}
                onOpenChange={(next) => {
                    setImportOpen(next);
                    if (!next && employees.length > 0) {
                        setDemoState('processed');
                    }
                }}
                onProcessed={handleImportProcessed}
            />

            {/* Review dialog: opened by "Gennemgå" per draft row */}
            <EmployeeEditDialogV2
                employee={reviewEmployee}
                onClose={() => setReviewEmployee(null)}
            />

            {/* Edit dialog: opened by pencil icon or row click in modal mode */}
            <EmployeeEditDialogV2
                employee={
                    editPenEmployee ??
                    (editMode === 'modal' ? modalEmployee : null)
                }
                onClose={() => {
                    setEditPenEmployee(null);
                    if (editMode === 'modal') setModalEmployee(null);
                }}
            />

            {editMode === 'schedule' && editPenEmployee === null && (
                <EmployeeEditDialogScheduleV1
                    employee={modalEmployee}
                    onClose={() => setModalEmployee(null)}
                />
            )}
        </div>
    );
}
