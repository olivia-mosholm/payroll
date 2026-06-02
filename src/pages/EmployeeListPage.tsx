import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Menu, Icon } from '@economic/taco';
import { EmptyState } from '../features/employee-onboarding/EmptyState';
import { DropZone } from '../features/employee-onboarding/DropZone';
import {
    UploadedFilesList,
    type UploadedFile,
} from '../features/employee-onboarding/UploadedFilesList';
import { EmployeeDraftsTable } from '../features/employee-onboarding/EmployeeDraftsTable';
import { ImportDialog } from '../features/employee-onboarding/ImportDialog';
import { mockEmployees, type Employee } from '../data/mockEmployees';
import {
    setEmployees as setStoreEmployees,
    appendEmployees as appendStoreEmployees,
    useEmployees,
} from '../store/employeesStore';
import { da } from '../data/danishCopy';
import { useVariantPaths } from '../paths';
import { EmployeeEditDialogV2 } from '../features/employee-onboarding/EmployeeEditDialogV2';
import { EmployeeEditDialogScheduleV1 } from '../features/employee-onboarding/EmployeeEditDialogScheduleV1';
import { ProcessingCompletedDialog } from '../features/employee-onboarding/ProcessingCompletedDialog';

type DemoState = 'empty' | 'uploaded' | 'processed';

const VALID_STATES: DemoState[] = ['empty', 'uploaded', 'processed'];

const PRESET_FILES: UploadedFile[] = [
    { id: 'file-1', name: 'Lønsedler_marts_2026.pdf', size: 248_320 },
    { id: 'file-2', name: 'Medarbejdere_oversigt.xlsx', size: 52_140 },
];

function nextFileId() {
    return `file-${Math.random().toString(36).slice(2, 9)}`;
}

type Props = {
    editMode?: 'page' | 'modal' | 'schedule';
};

export function EmployeeListPage({ editMode = 'page' }: Props = {}) {
    const isModalMode = editMode === 'modal' || editMode === 'schedule';
    const variantPaths = useVariantPaths();
    const [searchParams, setSearchParams] = useSearchParams();
    const stateParam = searchParams.get('state') as DemoState | null;
    const initialState: DemoState = stateParam && VALID_STATES.includes(stateParam)
        ? stateParam
        : 'empty';

    const [demoState, setDemoState] = useState<DemoState>(initialState);
    const [files, setFiles] = useState<UploadedFile[]>(
        initialState === 'uploaded' || initialState === 'processed' ? PRESET_FILES : []
    );
    const [processing, setProcessing] = useState(false);
    const employees = useEmployees();
    const [importOpen, setImportOpen] = useState(false);
    const navigate = useNavigate();

    // Seed the store from the demo state on first mount.
    useEffect(() => {
        if (initialState === 'processed' && employees.length === 0) {
            setStoreEmployees(mockEmployees);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (stateParam !== demoState) {
            const params = new URLSearchParams(searchParams);
            if (demoState === 'empty') params.delete('state');
            else params.set('state', demoState);
            setSearchParams(params, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [demoState]);

    const visibleEmployees = useMemo(
        () => (demoState === 'processed' ? employees : []),
        [demoState, employees]
    );

    const handleFiles = (newFiles: File[]) => {
        const mapped: UploadedFile[] = newFiles.map((f) => ({
            id: nextFileId(),
            name: f.name,
            size: f.size,
        }));
        setFiles((prev) => [...prev, ...mapped]);
        setDemoState('uploaded');
    };

    const handleRemove = (id: string) => {
        setFiles((prev) => {
            const next = prev.filter((f) => f.id !== id);
            if (next.length === 0) setDemoState('empty');
            return next;
        });
    };

    const handleProcess = () => {
        setProcessing(true);
        const filesSnapshot = files;
        // Every dropped file produces a draft. Prototype always shows at
        // least 3 drafts when there is any source file, so the test
        // experience is consistent.
        const MIN_DRAFTS = 3;
        const fileCount = filesSnapshot.length;
        const draftCount =
            fileCount === 0
                ? 0
                : Math.min(
                      mockEmployees.length,
                      Math.max(fileCount, MIN_DRAFTS)
                  );
        const createdEmployees = mockEmployees.slice(0, draftCount);
        window.setTimeout(() => {
            setProcessing(false);
            // Stage the drafts in the summary modal; they are committed to
            // the store only when the user clicks "Opret kladder".
            setProcessedSummary({
                mode: 'create',
                files: filesSnapshot,
                employees: createdEmployees,
            });
        }, 2000);
    };

    const handleConfirmCreate = () => {
        if (!processedSummary) return;
        if (processedSummary.mode === 'create') {
            setStoreEmployees(processedSummary.employees);
            setDemoState('processed');
        } else {
            appendStoreEmployees(processedSummary.employees);
        }
        setProcessedSummary(null);
    };

    // Dialog now handles appending itself; this is a no-op confirmation hook.
    const handleImportComplete = (
        info?: { files: UploadedFile[]; employees: Employee[] }
    ) => {
        if (info) {
            setProcessedSummary({
                mode: 'append',
                files: info.files,
                employees: info.employees,
            });
        }
    };

    const [modalEmployee, setModalEmployee] = useState<Employee | null>(null);
    /**
     * Independent of `modalEmployee`: when the pencil icon revealed on row
     * hover is clicked, we always open the V2 edit dialog regardless of the
     * variant's row-click behaviour. Tracked separately so it doesn't
     * collide with the schedule dialog on /scheduled-changes-v1.
     */
    const [editPenEmployee, setEditPenEmployee] = useState<Employee | null>(
        null,
    );
    const [processedSummary, setProcessedSummary] = useState<{
        mode: 'create' | 'append';
        files: UploadedFile[];
        employees: Employee[];
    } | null>(null);

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
                <h1 className="text-3xl font-normal leading-9 text-neutral-900">
                    {da.page.title}
                </h1>
            </div>

            {demoState === 'processed' ? (
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
                                                <Icon name="ai-stars" />
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
                        employees={visibleEmployees}
                        onRowClick={handleRowClick}
                        onEditClick={setEditPenEmployee}
                    />
                </>
            ) : (
                <>
                    {demoState !== 'empty' && (
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
                                                onClick={() =>
                                                    setImportOpen(true)
                                                }
                                            >
                                                <span className="inline-flex items-center justify-between gap-3 w-full">
                                                    <span>
                                                        {da.actions.quickCreate}
                                                    </span>
                                                    <Icon name="ai-stars" />
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
                    )}
                    <div className="mx-auto w-full max-w-[568px] flex flex-col gap-4">
                    <div className="rounded-[10px] p-6 flex flex-col gap-3 bg-white max-h-[calc(100vh-240px)] overflow-hidden">
                        <EmptyState compact={demoState === 'uploaded'} />
                        {demoState === 'empty' && (
                            <div className="flex justify-center">
                                <Button appearance="primary">
                                    {da.actions.addEmployee}
                                </Button>
                            </div>
                        )}
                        <DropZone
                            onFiles={handleFiles}
                            description={
                                demoState === 'empty'
                                    ? da.empty.body
                                    : undefined
                            }
                        />
                        {demoState === 'uploaded' && (
                            <div className="mt-2 flex-1 min-h-0 overflow-hidden">
                                <UploadedFilesList
                                    files={files}
                                    processing={processing}
                                    onRemove={handleRemove}
                                    onProcess={handleProcess}
                                />
                            </div>
                        )}
                    </div>
                    </div>
                </>
            )}

            <ImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                onProcessed={handleImportComplete}
            />

            <ProcessingCompletedDialog
                open={processedSummary !== null}
                onClose={() => setProcessedSummary(null)}
                onConfirm={handleConfirmCreate}
                files={processedSummary?.files ?? []}
                employees={processedSummary?.employees ?? []}
            />

            {/* V2 edit dialog: opened either by row click in modal mode OR
                by the pencil icon on any variant. The pen state wins so the
                schedule dialog doesn't accidentally show next to it. */}
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
