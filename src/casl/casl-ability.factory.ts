import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export enum Subject {
  Order = 'Order',
  Table = 'Table',
  Reservation = 'Reservation',
  MenuCategory = 'MenuCategory',
  MenuItem = 'MenuItem',
  MenuCombo = 'MenuCombo',
  Product = 'Product',
  StockEntry = 'StockEntry',
  Recipe = 'Recipe',
  Inventory = 'Inventory',
  Finance = 'Finance',
  Settings = 'Settings',
  User = 'User',
  Tenant = 'Tenant',
  Organization = 'Organization',
  All = 'all',
}

export type AppAbility = MongoAbility<[Action, Subject]>;

export type UserContext = {
  id: string;
  roles: string[];
};

export function createAbilityForUser(user: UserContext): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  const roles = user.roles ?? [];

  // ── Base abilities for all authenticated users (onboarding flow)
  // Allows new users to set up their profile, create a tenant, and join it
  can(Action.Read, Subject.User);
  can(Action.Update, Subject.User);
  can(Action.Create, Subject.Tenant);
  can(Action.Create, Subject.Organization);
  can(Action.Read, Subject.Organization);

  if (roles.includes('admin') || roles.includes('manager')) {
    // Manager / Admin : CRUD on everything
    can(Action.Manage, Subject.All);
  } else if (roles.includes('personal')) {
    // ── Orders: Create / Read / Update (no delete)
    can(Action.Create, Subject.Order);
    can(Action.Read, Subject.Order);
    can(Action.Update, Subject.Order);

    // ── Tables: Read + Update (status only, enforced at controller level)
    can(Action.Read, Subject.Table);
    can(Action.Update, Subject.Table);

    // ── Reservations: Read + Create
    can(Action.Read, Subject.Reservation);
    can(Action.Create, Subject.Reservation);

    // ── Menu / Products / Stock / Recipes / Inventory: Read only
    can(Action.Read, Subject.MenuCategory);
    can(Action.Read, Subject.MenuItem);
    can(Action.Read, Subject.MenuCombo);
    can(Action.Read, Subject.Product);
    can(Action.Read, Subject.StockEntry);
    can(Action.Read, Subject.Recipe);
    can(Action.Read, Subject.Inventory);

    // ── Finance / Settings / Users (members): Hidden (no access)
    // These `cannot` rules override the base `can` rules above
    cannot(Action.Manage, Subject.Finance);
    cannot(Action.Manage, Subject.Settings);
    cannot(Action.Manage, Subject.User);

    // ── Tenant / Organization: Read only
    can(Action.Read, Subject.Tenant);
    can(Action.Read, Subject.Organization);
  }

  return build();
}
