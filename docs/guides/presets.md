# Collection Presets

> Presets store the state of a Collection Detail page. They can be used to set layout defaults or define bookmarks to
> specific datasets. [Learn more about Presets](/concepts/presets/).

## Creating a Preset

1. Navigate to **Settings > Presets & Bookmarks**
2. Click the **Create Preset** action button in the header
3. Complete the **other preset form fields** outlined below

- **Collection** — The collection of this preset; supports any project collection, Directus Files, or Directus Users
- **Scope** — The users that will have access to this preset, either Global, a specific Role, or an individual User
- **Layout** — The collection detail's layout this preset applies to
- **Name** — If left blank, this preset will act as a Default for the collection/layout; if given a name, it will be
  shown as a bookmark

After you have completed the form, the layout preview will be populated with live data. You can now tailor the layout as
desired by updating the preview or the filter component in the page sidebar.

Each preset saves all of the information needed to recreate a view of the collection/layou, including: the full-text
search query, any advanced filters added, sort field, sort direction, and all other specific layout options.

::: tip Defaults vs Bookmarks

It's important to be aware of the difference between a collection's _defaults_ and its _bookmarks_, both of which are
configured by presets. A _default_ is how a user will initially view the collection detail without any further
customization, while a _bookmark_ is a named dataset that can be recalled at any point via the
[collection navigation](/guides/roles/#customizing-the-collection-navigation).

:::

::: tip System Defaults

You can also adjust the defaults and bookmarks for the Directus Activity, Directus Files, and Directus Users
collections.

:::

::: tip Order of Defaults

Multiple defaults can be configured for a user, either for different layouts of even the same layout. In this case, the
preset priority is: User, then Role, then Global.

:::

## Deleting a Preset

1. Navigate to **Settings > Presets & Bookmarks > [Preset]**
2. Click the red **Delete Preset** action button in the header
3. Confirm this decision by clicking **Delete** in the dialog

::: danger Irreversible Change

This action is permanent and can not be undone. Please proceed with caution.

:::
