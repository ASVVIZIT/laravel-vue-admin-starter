export default {
  route: {
    dashboard: 'Dashboard',
    permission: 'Permissions',
    pagePermission: 'Page Permissions',
    rolePermission: 'Role Permissions',
    directivePermission: 'Directives',
    charts: 'Charts',
    keyboardChart: 'Keyboard Chart',
    lineChart: 'Line Chart',
    mixChart: 'Mix Chart',
    table: 'Table',
    form: 'Form',
    errorPages: 'Error Pages',
    page401: '401',
    page404: '404',
    administrator: 'Administrator',
    users: 'Users',
    userProfile: 'User Profile',
    guide: 'Website Guide',
  },
  navbar: {
    logOut: 'Log Out',
    dashboard: 'Dashboard',
    github: 'Github',
    theme: 'Theme',
    size: 'Global Size',
    profile: 'Profile',
    logout: 'Log Out',
    home: 'Home'
  },
  login: {
    title: 'Log in to Your Account',
    logIn: 'Log In',
    username: 'Username',
    password: 'Password',
    any: 'any',
    thirdparty: 'Or connect with',
    thirdpartyTips: 'Cannot be simulated locally. Please implement your own business logic!',
    email: 'Email',
    loginSuccess: 'Login Successful'
  },
  validation: {
    general: {
      notNameAdmin: 'This name is not allowed',
      required: 'Required field',
      minLength: 'Minimum {min} characters',
      email: 'Invalid email',
      phone: 'Invalid phone format',
      match: 'Must match {field}',
      specialChars: 'At least {min} special characters required',
      notMatch: 'Password must not match {field}',
      passwordNotEmail: 'Password must not match email',
      passwordNotName: 'Password must not match name',
      matchPassword: 'Passwords must match'
    },
    fields: {
      password: 'password',
      phone: 'phone',
      email: 'email',
      name: 'name'
    },
    rules: {
      role: { required: 'Role is required' },
      name: { required: 'Name is required' },
      sex: { required: 'Gender is required' },
      email: {
        required: 'Email is required',
        type: 'Enter a valid email'
      },
      password: { required: 'Password is required' },
      confirmPassword: {
        required: 'Confirm password',
        mismatched: 'Passwords do not match!'
      }
    }
  },
  permission: {
    actions: {
      addRole: 'Add Role Permission',
      editPermission: 'Edit Permissions',
      delete: 'Delete',
      confirm: 'Confirm',
      cancel: 'Cancel'
    },
    messages: {
      editPermissionForForm: 'Edit permissions for',
      switchRoles: 'Switch roles',
      tips: 'In some cases, using v-role/v-permission is not suitable (e.g., Element Tab component or el-table-column). Use v-if with checkRole/checkPermission instead.'
    },
    table: {
      edit: { user: 'Edit Access Rights' },
      rolePermissions: { name: 'Inherited from role' },
      userPermissions: {
        name: {
          menu: 'Additional Menus',
          permissions: 'Additional Permissions'
        }
      },
      elMessageBox: {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        warning: 'Warning',
        continue: 'Continue?',
        confirm1: { message: 'This will permanently delete the user' }
      },
      elMessage: {
        update: { success: { message: 'Permissions updated successfully' } },
        delete: {
          success: { message: 'Deletion completed' },
          canceled: { message: 'Deletion canceled' }
        },
        newUser: {
          success: {
            message: {
              part1: 'New user',
              part2: 'has been created successfully.'
            }
          }
        },
        confirmPermission: {
          success: { message: 'Permissions updated successfully' }
        }
      }
    }
  },
  table: {
    general: {
      description: 'Description',
      dynamicTips1: 'Fixed header, sorted by header order',
      dynamicTips2: 'Unfixed header, sorted by click order',
      dragTips1: 'Default order',
      dragTips2: 'Order after dragging',
      title: 'Title',
      importance: 'Importance',
      type: 'Type',
      remark: 'Remark',
      search: 'Search',
      add: 'Add',
      filterReset: 'Reset all filters',
      export: 'Export',
      reviewer: 'Reviewer',
      id: 'ID',
      date: 'Date',
      author: 'Author',
      readings: 'Readings',
      status: 'Status',
      actions: 'Actions',
      edit: 'Edit',
      publish: 'Publish',
      draft: 'Draft',
      delete: 'Delete',
      cancel: 'Cancel',
      confirm: 'Confirm'
    },
    user: {
      form: {
        title: {
          create: 'Create New User',
          edit: 'Edit User'
        },
        about_me: 'About Me',
        education: 'Education',
        skills: 'Skills',
        tabs: {
          timeline: 'Timeline',
          account: 'Account'
        },
        fields: {
          role: { title: 'Role', placeholder: 'Select a role' },
          name: { title: 'Name', placeholder: 'Your name' },
          email: { title: 'Email', placeholder: 'Your email' },
          password: { title: 'Password', placeholder: 'Enter password' },
          confirmPassword: { title: 'Confirm Password', placeholder: 'Must not match name or email' },
          sex: { title: 'Gender', placeholder: '' },
          male: { title: 'Male', placeholder: '' },
          female: { title: 'Female', placeholder: '' },
          age: { title: 'Age', placeholder: 'Birthdate not specified' },
          birthday: { title: 'Birthday', placeholder: 'Select birthdate' },
          description: { title: 'Description', placeholder: 'Write about yourself...' }
        }
      },
      columns: {
        id: 'ID',
        name: 'Name',
        email: 'Email',
        role: 'Role'
      },
      elMessageBox: {
        deleteTitle: 'Deleting a user!',
        confirmButtonText: 'Accept',
        cancelButtonText: 'Cancel',
        warning: 'Warning',
        continue: 'Continue?',
        confirm1: { "message@j": 'This will permanently delete the user.<br><strong>{name}</strong>' }
      },
      "elMessage": {
        "created": {
          "success": {
            "message": "User created"
          },
          "error": {
            "message": "User creation error"
          }
        },
        "delete": {
          "success": { "message": "User successfully deleted" },
          "error": { "message": "User deletion error" },
          "canceled": { "message": "Deletion canceled" }
        },
        "newUser": {
          "success": {
            "message": {
              "part1": "New user",
              "part2": "has been successfully created."
            }
          }
        }
      }
    }
  },
  tagsView: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  settings: {
    title: 'Page Style Settings',
    theme: 'Theme Color',
    tagsView: 'Enable Tags-View',
    fixedHeader: 'Fixed Header',
    sidebarLogo: 'Sidebar Logo'
  },
  user: {
    profile: {
      notfound: 'User not found',
      avatar: 'Avatar',
      about_me: 'About Me',
      education: 'Education',
      skills: 'Skills',
      tabs: {
        timeline: 'Timeline',
        account: 'Account'
      },
      elMessage: {
        update: {
          success: {
            message: 'User information has been updated successfully'
          }
        },
      },
      fields: {
        role: { title: 'Role', placeholder: 'Select a role' },
        name: { title: 'Name', placeholder: 'Your name' },
        email: { title: 'Email', placeholder: 'Your email' },
        password: { title: 'Password', placeholder: 'Enter password' },
        confirmPassword: { title: 'Confirm Password', placeholder: 'Must not match name or email' },
        sex: { title: 'Gender', placeholder: '' },
        male: { title: 'Male', placeholder: '' },
        female: { title: 'Female', placeholder: '' },
        age: { title: 'Age', placeholder: 'Birthdate not specified' },
        birthday: { title: 'Birthday', placeholder: 'Select birthdate' },
        description: { title: 'Description', placeholder: 'Write about yourself...' }
      }
    }
  },
  roles: {
    name: 'Role',
    description: {
      superadmin: 'Super Administrator: Full access to all pages and features.',
      admin: 'Administrator: Full access to all pages.',
      manager: 'Manager: Access to most pages except permissions.',
      editor: 'Editor: Access to articles and related resources.',
      user: 'User: Limited access to specific pages.',
      visitor: 'Visitor: Access to static pages only.'
    }
  },
  switchLang: {
    localName: 'Language switched successfully'
  },
  form: {
    button: {
      save: 'Save',
      cancel: 'Cancel'
    }
  }
};
