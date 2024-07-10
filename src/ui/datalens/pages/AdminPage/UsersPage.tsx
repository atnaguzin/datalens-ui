import React, { useEffect, useState } from 'react';
import Utils from 'ui/utils';
import { I18n } from 'i18n';
import { Table, Button, Text, Loader } from '@gravity-ui/uikit';
import { BaseAdminForm } from './BaseAdminForm';
import { UserAdminFields } from './UserAdminFields';
import block from 'bem-cn-lite';
import './BaseAdmin.scss';
import { UsersPageToolbar } from './UsersPageToolbar';

const i18n = I18n.keyset('component.admin-pages');

const b = block('base-admin');

const UsersTables = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [record, setRecord] = useState<Object | null>(null);

  const columns = [
    { id: 'id', name: 'ID' },
    { id: 'c_login', name: i18n('login') },
    { id: 'c_claims', name: i18n('roles') },
    { id: 'c_project_name', name: i18n('project'), },
    {
      id: 'action', name: i18n('action'), template: (item: any) => item.b_base ? null : <Button onClick={onEdit(item)} size="m">{i18n("change")}</Button>
    },
  ];

  function onEdit(item: any) {
    return () => setRecord({
      ...item,
      c_project_name: [item.c_project_name],
      c_claims: item.c_claims.split(".").filter((item: any) => item)
    });
  }

  function onSearch(value: string) {
    setLoading(true);
    setRecord(null);
    loadUsers(value).then((users) => {
      setData(users.data);
    }).finally(() => {
      setLoading(false);
    });
  }

  function onCreate() {
    setRecord({})
  }

  function onRefresh() {
    setLoading(true);
    loadUsers().then((users)=>{
      setData(users.data);
    }).finally(() => {
      setLoading(false);
    });
    setRecord(null);
  }

  async function onSave(values: any) {
    console.log("onSave", values);


    if (!values.id) {
      const { err } = await Utils.universalService(
        {
          "action": "datalens",
          "method": "create_user",
          "data": [
            {
              "c_login": values.c_login,
              "c_email": values.c_email,
              "c_password": values.c_password,
              "c_claims": values.c_claims,
              "b_disabled": values.b_disabled,
              "c_project_name": values.c_project_name[0]
            }
          ]
        }
      );
      if (err) {
        return setError(err);
      }
    } else {
      const { err } = await Utils.universalService(
        {
          "action": "datalens",
          "method": "update_user",
          "data": [{ 
            "id": values.id,
            "c_login": values.c_login,
            "c_email": values.c_email,
            "b_disabled": values.b_disabled,
            "c_project_name": values.c_project_name[0]
          }]
        }
      );
      if (err) {
        return setError(err);
      }

      const { roles_err } = await Utils.universalService(
        {
          "action": "datalens",
          "method": "update_roles",
          "data": [{ 
            "id": values.id,
            "c_claims": values.c_claims
          }]
        }
      );
      if (roles_err) {
        return setError(roles_err);
      }

      const { password_err } = await Utils.universalService(
        {
          "action": "datalens",
          "method": "password_reset",
          "data": [{ 
            "c_login": values.c_login,
            "c_password": values.c_password,
          }]
        }
      );
      if (password_err) {
        return setError(password_err);
      }
    }
    loadUsers().then((users) => {
      setData(users.data);
    });
    setRecord(null);
  }

  async function loadUsers(value: string = '') {
    const params: any = {};
    if (value) {
      params.filter = value
    }
    const users = await Utils.universalService({ "action": "datalens", "method": "users", "data": [params] });
    return users;
  }

  async function loadData() {
    const roles = await Utils.universalService({ "action": "datalens", "method": "roles", "data": [{}] });
    const projects = await Utils.universalService({ "action": "datalens", "method": "projects", "data": [{}] });
    return { roles, projects };
  }

  useEffect(() => {
    setLoading(true);
    loadData().then(({ roles, projects }) => {
      setRoles(roles.data)
      setProjects(projects.data)
      loadUsers().then((users) => {
        setData(users.data);
      }).finally(() => {
        setLoading(false);
      });
    }).finally(() => {
      setLoading(false);
    });
  }, []);



  return <div className={b("wrapper")}>
    <Text className={b("title")} variant="header-1">{i18n("users")}</Text>
    <div className="alert alert-light" role="alert">
      {i18n("alert_message")}
    </div>
    <UsersPageToolbar
      onSearch={onSearch}
      onCreate={onCreate}
      onRefresh={onRefresh}
    />
    <div className={b("container")}>
      {loading ? <Loader className={b("table")} /> : <Table data={data} columns={columns} className={b("table")} />}
      {record && <BaseAdminForm
        error={error}
        className={b("form")}
        title={i18n('edit_user')}
        stores={{
          roles: roles,
          projects: projects
        }}
        record={record}
        fieldsComponent={UserAdminFields}
        onSave={onSave}
        onCancel={() => setRecord(null)}
      />}
    </div>
  </div>
}

export default UsersTables;
