# Technical Specification: Drag‑&‑Drop Rust Smart Contract Builder

## 1. Overview
Provide engineers and AI systems with exhaustive details to implement a production‑grade, Blockly‑driven Rust smart contract builder targeting Solana.

## 2. Architecture

1. **Frontend (UI)**
   - **Blockly Workspace**: Visual editor embedding custom blocks. Uses `blocklyConfig.ts` to define block shapes, fields, mutators, and validation logic.
   - **Integration Layer**: A thin adapter to load `defineCustomBlocks(Blockly)` and wire up the Rust generator.
   - **Error & Warning UI**: Leverage `block.setWarningText()` and `block.error()` in `onchange` handlers.

2. **Generator Engine**
   - **TypeScript Glue** (`rustGenerator.ts`)
     - Instantiates `new Blockly.Generator("Rust")` with custom settings (indentation, reserved words).
     - Registers `forBlock` methods for each block type: entrypoint, conditionals, loops, functions, accounts, instructions, error blocks.
     - Provides `init(workspace)` to seed variable maps, and `finish(code)` to prepend license and `use` statements.
     - Exposes `codegenError(block, message)` to throw detailed code‑gen exceptions.

3. **Rust Output**
   - **Module Structure**:
     - **entrypoint.rs**: `process_instruction` stub with `msg!` logging.
     - **instructions.rs**: Per-block logic compiled into helper functions.
     - **errors.rs**: Custom error types implementing `From<ProgramError>`.
     - **schema.rs**: Account struct definitions, input serializers/deserializers.
   - **Formatting**: Use `rustfmt` via CI to enforce style.

4. **Testing & CI**
   - **Unit Tests**:
     - Headless Blockly workspace loads XML fixtures, runs generator, asserts AST validity via `syn::parse_file`.
   - **Integration Tests**:
     - Compile generated code with `cargo build` in isolated temp directories.
     - Deploy to local Solana test validator (`solana-test-validator`) and execute trivial transaction.
   - **Linting**:
     - `clippy` enforced in CI.
     - TypeScript linting (`eslint + prettier`) on generator code.

## 3. Block Definitions & Generator Methods

| Block Name            | Inputs                  | Mutator/Nesting           | Generator Method         | Validation                    |
|-----------------------|-------------------------|---------------------------|---------------------------|-------------------------------|
| `solana_program`      | PROGRAM_NAME, BODY      | Single statement list     | `rustGenerator.forBlock['solana_program']` | Must supply PROGRAM_NAME, BODY not empty |
| `controls_if`         | IF0/DO0, [IF1/DO1...], ELSE | Mutable else‑if counts    | `rustGenerator.forBlock['controls_if']`    | Ensure each IF has DO; else only if `elseCount_ > 0` |
| `controls_for`        | VAR, START, END, STEP, DO | Fixed loop                | TBD                       | START, END numeric; STEP ≠ 0      |
| `controls_while`      | BOOL, DO                 | Fixed loop                | TBD                       | BOOL must parse to `bool` type   |
| `procedures_defreturn`| NAME, ARGS, DO, RETURN  | Function def              | TBD                       | Unique NAME; ARGS named; RETURN type matches body |
| `procedures_callreturn`| NAME, ARGS             | Function call             | TBD                       | NAME exists; ARGS count/type match |
| `account_param`       | ACCOUNT_NAME, TYPE      | List nesting under `solana_program` | TBD          | At least one account required; unique per transaction |
| `program_error`       | ERROR_CODE, MESSAGE     | Global errors enum        | TBD                       | ERROR_CODE numeric; MESSAGE nonempty |

**Note**: Each `TBD` generator method must mirror the Solana Program Library (SPL) idioms using `Pubkey`, `AccountInfo`, and `ProgramError`.

## 4. Error Handling Strategy

1. **Design‑Time**: Use Blockly’s `onchange` event for structural validations:
   - Missing required input → `block.setWarningText('FIELD is required')`
   - Invalid nesting → `block.setWarningText('Block must be inside solana_program')`

2. **Codegen‑Time**:
   - Any missing or malformed value triggers `codegenError(block, msg)` with block coordinates.
   - Uncaught codegen exceptions bubble up to the UI, highlighting the offending block.

## 5. Build & Deployment

- **TypeScript Build**: `tsc --project tsconfig.json` produces `rustGenerator.js` bundle.
- **Package**: Distribute as NPM package with peer dependencies on `blockly`.
- **CI**: GitHub Actions workflow to:
  1. Run `npm test` (JS/TS lint + generator unit tests)
  2. Publish to NPM on tag.

## 6. Deliverables for Engineers

- `blocklyConfig.ts`: complete block definitions with fields, mutators, JSON specs.
- `rustGenerator.ts`: fully fleshed `forBlock` methods for all block types.
- Rust module templates (`entrypoint.rs`, `instructions.rs`, etc.).
- CI configuration (`.github/workflows/ci.yml`).
- Sample workspace XML fixtures + test harness.

---

*This spec can be fed verbatim to engineering teams or AI code‑generation agents to scaffold a full implementation.*
