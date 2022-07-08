const Notification = {
  "Request Failed": "Request Failed",
  "Open List": "Open List",
  Created: "Created",
  Saved: "Saved",
  "Changes Saved": "Changes Saved",
  Deleted: "Deleted",
  "Create Failed": "Create Failed",
  "Save Failed": "Save Failed",
  "Batch Request Completed": "Batch Request Completed",
  "Delete Failed": "Deleted Failed"
}

const en = {
  core: {
    // LeftMenu/SettingMenu
    Setting: "Setting",
    "Menu Setting": "Menu Setting",
    "Schema Manager": "Schema Manager",
    "Data Migration": "Data Migration",
    // TopBar/RightMenu
    "Reset Local Database": "Reset Local Database",
    "Signed as $username": "Signed as {{name}}",
    Profile: "Profile",
    "Switch account": "Switch account",
    "Add another account": "Add another account",
    Logout: "Logout",
    // others
    ...Notification,
    Show: "Show",
    Confirm: "Confirm",
    Cancel: "Cancel",
    "Request Failed": "Request Failed"
  },
  plugins: {
    // LeftMenu
    User: "User",
    Users: "Users"
  },
  table: {
    /**
     * Bunadmin core
     */
    // menu
    "Menu Manager": "Menu Manager",
    Id: "ID",
    Name: "Name",
    Label: "Label",
    Slug: "Slug",
    Icon: "Icon",
    "Icon Type": "Icon Type",
    Parent: "Parent",
    Rank: "Rank",
    // schema
    "Schema Manager": "Schema Manager",
    Team: "Team",
    Group: "Group",
    Customized: "Customized",
    "Created At": "Created At",
    "Updated At": "Updated At",
    Columns: "Columns",
    // notice
    "Local Notice": "Local Notice",
    Title: "Title",
    Severity: "Severity",
    Success: "Success",
    Error: "Error",
    Info: "Info",
    Warning: "Warning",
    Content: "Content",
    // auth
    Authentication: "Authentication",
    Username: "Username",
    Role: "Role",
    Details: "Details",
    "Last Signed-in": "Last Signed-in",
    // migration
    Migration: "Migration",
    Upload: "Upload",
    Download: "Download",
    Count: "Count",
    Key: "Key",
    Export: "Export",
    Import: "Import",
    "Do you want to backup the current database locally?":
      "Do you want to backup the current database locally?",
    "Are you sure you want to import and overwrite the database?":
      "Are you sure you want to import and overwrite the database?",
    // setting
    "Bunadmin Setting": "Bunadmin Parameters",
    Value: "Value",
    // notice
    "SUCCESS!": "SUCCESS!",
    "WARNING!": "WARNING!",
    "ERROR!": "ERROR!",
    "INFO!": "INFO!",
    // status
    Draft: "Draft",
    Ready: "Ready",
    Approved: "Approved",
    Rejected: "Rejected",
    Published: "Published",
    // others
    ...Notification,
    User: "User",
    Email: "Email",
    Detail: "Detail",
    "Null(ROOT)": "Null(ROOT)",
    Pos: "Rank",
    Save: "Save",

    /**
     * material-table
     */
    // actions
    "Refresh Data": "Refresh Data",
    // headers
    actions: "Actions",
    // toolbar
    searchTooltip: "Search",
    searchPlaceholder: "Search",
    nRowsSelected: "{0} row(s) selected",
    exportTitle: "Export",
    exportAriaLabel: "Export",
    exportCSVName: "Export as CSV",
    // body
    addTooltip: "Add",
    editTooltip: "Edit",
    deleteTooltip: "Delete",
    emptyDataSourceMessage: "No records to display",
    // body filterRow
    filterTooltip: "Filter",
    // body editRow
    deleteText: "Are you sure delete this row?",
    cancelTooltip: "Cancel",
    saveTooltip: "Save",
    // grouping
    groupedBy: "Grouped By:",
    placeholder: "Draggable fields here to group ...",
    // pagination
    firstTooltip: "First Page",
    firstAriaLabel: "First Page",
    previousTooltip: "Previous Page",
    previousAriaLabel: "Previous Page",
    nextTooltip: "Next Page",
    nextAriaLabel: "Next Page",
    labelDisplayedRows: "{from}-{to} of {count}",
    labelRowsPerPage: "Rows per page:",
    lastTooltip: "Last Page",
    lastAriaLabel: "Last Page",
    labelRowsSelect: "rows"
  }
}
export default en
