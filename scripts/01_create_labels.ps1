$gh = "C:\Program Files\GitHub CLI\gh.exe"
$repo = "luca-prop/SeedFit_App"

# Label 정의: name, color, description
$labels = @(
    @("epic:foundation", "0E8A16", "Step 1: Contract & Data (INIT, DB, API-SPEC, MOCK)"),
    @("epic:feature", "1D76DB", "Step 2: Logic & Mutation (LIB, FE, BE)"),
    @("epic:test", "FBCA04", "Step 3: Tests (TEST, TEST-INT)"),
    @("epic:nfr", "D93F0B", "Step 4: NFR & Infra (NFR)"),
    @("track:frontend", "5319E7", "Agent Track: Frontend (FE-*)"),
    @("track:backend", "B60205", "Agent Track: Backend (BE-*, LIB-*)"),
    @("track:data", "333333", "Agent Track: Data/Infra (DB-*, MOCK-*, NFR-*)"),
    @("complexity:L", "E4E669", "Low complexity (1 day)"),
    @("complexity:M", "F9A825", "Medium complexity (2 days)"),
    @("complexity:H", "D32F2F", "High complexity (3 days)"),
    @("priority:critical-path", "FF0000", "Critical path - blocks project timeline"),
    @("sprint:0", "C2E0C6", "Sprint 0: Foundation (5/15-5/18)"),
    @("sprint:1", "BFD4F2", "Sprint 1: Core Data (5/19-5/23)"),
    @("sprint:2", "D4C5F9", "Sprint 2: Core Features (5/26-6/1)"),
    @("sprint:3", "F9D0C4", "Sprint 3: Dashboard & B2B (6/2-6/8)"),
    @("sprint:4", "FDD0A2", "Sprint 4: Admin & Test (6/9-6/15)"),
    @("sprint:5", "F8B4B4", "Sprint 5: QA & Deploy (6/16-6/27)")
)

foreach ($label in $labels) {
    Write-Host "Creating label: $($label[0])..."
    & $gh label create $label[0] --repo $repo --color $label[1] --description $label[2] --force 2>&1
    Start-Sleep -Milliseconds 300
}
Write-Host "Done! All labels created."
