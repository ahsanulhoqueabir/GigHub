# 9. Use Cases & Actors

> Source: [`web/data/schema/use_cases.json`](../../web/data/schema/use_cases.json) (also available as `use_case_diagram.drawio` / `.puml`). Rendered here as a Mermaid use-case-style flowchart plus a relation table, since Mermaid has no native UML use-case diagram type.

## 9.1 Actors

| Actor                            | Description                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| **Guest**                        | Unauthenticated visitor — base actor other roles inherit from |
| **Buyer** _(inherits Guest)_     | A student placing/tracking gig orders                         |
| **Seller** _(inherits Guest)_    | A student offering gigs                                       |
| **Job Owner** _(inherits Guest)_ | A student posting jobs and selecting proposals                |
| **Applicant** _(inherits Guest)_ | A student submitting job proposals                            |
| **Admin**                        | Platform moderator/operator                                   |
| **Moderator**                    | Content moderation subset of Admin's powers                   |

> Note: Buyer/Seller/Job Owner/Applicant are **not separate accounts** — every authenticated `profile` can act as any of these simultaneously depending on context (see [01-overview-and-features.md §1.2](./01-overview-and-features.md#12-roles)).

## 9.2 Use Cases by Category

| Category         | Use Cases                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| General          | Register/Login, Manage Profile, Browse Categories                                                                                                                  |
| Gig / Seller     | Create/Manage Gig, Browse Gigs, Place Gig Order                                                                                                                    |
| Job              | Post Job, Browse Jobs, Submit Job Proposal, Accept Proposal / Create Order                                                                                         |
| Order Lifecycle  | Track Order Status, Request Order Cancellation, Chat with Buyer/Seller, Send Attachment                                                                            |
| Payments         | Make Payment, Deposit/Withdraw Wallet, Fund Escrow, Release Escrow Payment, View Wallet Records                                                                    |
| Reviews          | Leave Review & Rating                                                                                                                                              |
| Admin/Moderation | Manage Departments & Categories, Manage Hero Banners, Manage Ad Banners, Manage Announcements, Configure System Settings, Moderate Content/Users, Suspend/Ban User |

## 9.3 Actor → Use Case Diagram

```mermaid
flowchart LR
    Guest([Guest])
    Buyer([Buyer]) -.inherits.-> Guest
    Seller([Seller]) -.inherits.-> Guest
    JobOwner([Job Owner]) -.inherits.-> Guest
    Applicant([Applicant]) -.inherits.-> Guest
    Admin([Admin])
    Moderator([Moderator])

    Guest --> UC_Auth[Register / Login]
    Guest --> UC_Browse[Browse Categories]
    Guest --> UC_BrowseGigs[Browse Gigs]
    Guest --> UC_BrowseJobs[Browse Jobs]

    Buyer --> UC_Profile[Manage Profile]
    Buyer --> UC_OrderGig[Place Gig Order]
    Buyer --> UC_TrackOrder[Track Order Status]
    Buyer --> UC_CancelOrder[Request Order Cancellation]
    Buyer --> UC_Chat[Chat with Buyer/Seller]
    Buyer --> UC_Wallet[Deposit / Withdraw Wallet]
    Buyer --> UC_Review[Leave Review & Rating]

    Seller --> UC_Profile
    Seller --> UC_ManageGig[Create / Manage Gig]
    Seller --> UC_TrackOrder
    Seller --> UC_Chat
    Seller --> UC_Wallet
    Seller --> UC_WalletRecords[View Wallet Records]

    JobOwner --> UC_Profile
    JobOwner --> UC_PostJob[Post Job]
    JobOwner --> UC_AcceptProposal[Accept Proposal / Create Order]
    JobOwner --> UC_Chat
    JobOwner --> UC_CancelOrder

    Applicant --> UC_Profile
    Applicant --> UC_Proposal[Submit Job Proposal]
    Applicant --> UC_Chat

    Admin --> UC_ManageCategories[Manage Departments & Categories]
    Admin --> UC_ManageHero[Manage Hero Banners]
    Admin --> UC_ManageAds[Manage Ad Banners]
    Admin --> UC_ManageAnnouncements[Manage Announcements]
    Admin --> UC_SystemConfig[Configure System Settings]
    Admin --> UC_Moderate[Moderate Content / Users]
    Admin --> UC_BanUser[Suspend / Ban User]

    Moderator --> UC_Moderate
    Moderator --> UC_ManageAnnouncements
    Moderator --> UC_BanUser

    UC_OrderGig -. include .-> UC_Payment[Make Payment]
    UC_AcceptProposal -. include .-> UC_Payment
    UC_Payment -. include .-> UC_Escrow[Fund Escrow]
    UC_Escrow -. include .-> UC_Wallet
    UC_ReleaseEscrow[Release Escrow Payment] -. include .-> UC_WalletRecords
    UC_ReleaseEscrow -. include .-> UC_Wallet

    UC_SendAttachment[Send Attachment] -. extend .-> UC_Chat
    UC_CancelOrder -. extend .-> UC_Chat
    UC_Review -. extend .-> UC_TrackOrder
    UC_BanUser -. extend .-> UC_Moderate
    UC_ManageGig -. extend .-> UC_Browse
    UC_PostJob -. extend .-> UC_Browse
```

## 9.4 Include / Extend Relationships

| Base use case                  | Relationship | Target use case                              | Meaning                                                     |
| ------------------------------ | ------------ | -------------------------------------------- | ----------------------------------------------------------- |
| Place Gig Order                | include      | Make Payment                                 | Every gig order requires payment                            |
| Accept Proposal / Create Order | include      | Make Payment                                 | Accepting a proposal also requires funding                  |
| Make Payment                   | include      | Fund Escrow                                  | Payments always flow into escrow, never direct-to-seller    |
| Fund Escrow                    | include      | Deposit/Withdraw Wallet                      | Escrow funding touches the wallet ledger                    |
| Release Escrow Payment         | include      | View Wallet Records, Deposit/Withdraw Wallet | Releasing escrow writes a wallet record and updates balance |
| Send Attachment                | extend       | Chat with Buyer/Seller                       | Optional add-on to a chat message                           |
| Request Order Cancellation     | extend       | Chat with Buyer/Seller                       | Cancellation flow surfaces through chat notifications       |
| Leave Review & Rating          | extend       | Track Order Status                           | Reviewing is an optional step after order completion        |
| Suspend/Ban User               | extend       | Moderate Content/Users                       | Banning is one possible moderation action                   |
| Create/Manage Gig              | extend       | Browse Categories                            | Gig creation reuses the category browser for selection      |
| Post Job                       | extend       | Browse Categories                            | Job posting reuses the category browser for selection       |
