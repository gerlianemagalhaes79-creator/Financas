# Security Specification - Personal Finance Control

This document outlines the security parameters, data invariants, and access control policies for our Firestore database, following a Zero-Trust/ABAC model.

## Data Invariants

1. **Owner Integrity**: Every resource (`fixedBill`, `creditCard`, `transaction`) must belong to the authenticated user who created it. The `ownerId` field in the payload must strictly match the authenticated user's `uid`.
2. **Positive Values**: Financial amounts (`amount` and `limit`) must be greater than zero.
3. **Valid Month Days**: `dueDate`, `closingDay`, and `dueDay` must be valid integer days of the month (between 1 and 31).
4. **No Identity Spoofing**: Users cannot create or update any document with an `ownerId` that does not match their `request.auth.uid`.
5. **Read Privacy**: Users are only allowed to query and view their own documents. Blanket reads are strictly prohibited.
6. **Immutable Fields**: `id`, `ownerId`, and `createdAt` cannot be modified after document creation.

---

## The "Dirty Dozen" Poison Payloads (Attempted Exploits)

The following payloads represent malicious attempts to bypass security. Our Firestore rules are configured to reject all of them with `PERMISSION_DENIED`.

1. **Spoofed Ownership (Create)**
   - *Attempt*: Create a `creditCard` or `fixedBill` with an `ownerId` belonging to another user.
   - *Result*: **FAILED** (Rejected by ownership validation).

2. **Negative Spending (Create/Update)**
   - *Attempt*: Add a transaction with a negative value to artificially increase budget/limit.
   - *Result*: **FAILED** (Rejected by amount constraint validation).

3. **Orphaned Card Transaction (Create)**
   - *Attempt*: Register a transaction linked to a non-existent card or a card owned by another user.
   - *Result*: **FAILED** (Rejected by validating the card relationship using `exists()`).

4. **Junk Field Pollution (Shadow Fields)**
   - *Attempt*: Inject administrative flags like `isVerified: true` or `isAdmin: true` into a document.
   - *Result*: **FAILED** (Rejected by strict schema keys count and `affectedKeys()` validations).

5. **ID Path Poisoning**
   - *Attempt*: Creating a transaction with an extremely long ID containing malicious scripts or special Characters.
   - *Result*: **FAILED** (Rejected by `isValidId()` regex check).

6. **Over-limit Day Values**
   - *Attempt*: Add a `creditCard` with a `closingDay` of `45`.
   - *Result*: **FAILED** (Rejected by numeric boundary constraint).

7. **Date Spoofing (CreatedAt)**
   - *Attempt*: Setting a custom historical `createdAt` Timestamp to manipulate reports.
   - *Result*: **FAILED** (Rejected by enforcing `request.time` server timestamp check).

8. **Blanket Query Unsecured Read**
   - *Attempt*: User B executes a list query to fetch all transactions without filtering by `ownerId`.
   - *Result*: **FAILED** (Blocked by `allow list` checking `resource.data.ownerId == request.auth.uid`).

9. **Owner Mutation (Update)**
   - *Attempt*: Change the `ownerId` of a transaction to transfer it to another user.
   - *Result*: **FAILED** (Rejected by checking immutability `incoming().ownerId == existing().ownerId`).

10. **Type Pollution**
    - *Attempt*: Send a string `"100.50"` instead of a proper double number in the `amount` field.
    - *Result*: **FAILED** (Blocked by `data.amount is number` data type constraint).

11. **Malicious Empty String Category**
    - *Attempt*: Save a transaction description with an empty name or category containing excessive white spaces.
    - *Result*: **FAILED** (Rejected by sizing constraints `data.description.size() > 0`).

12. **Out of Range Closing Date**
    - *Attempt*: Create a Credit Card object where `closingDay` is set to `0`.
    - *Result*: **FAILED** (Rejected by numeric scale boundaries).
