import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Maps from "views/examples/Maps.js";
import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import Tables from "views/examples/Tables.js";
//import Icons from "views/examples/Icons.js";
import ConfirmEmail from "./views/examples/ConfirmEmail";
import EditProfile from "./views/examples/EditProfile";
import UsersTable from "./views/examples/UsersTable";
import ResetPassword from "./views/examples/ResetPassword";
import ConfirmPassword from "./views/examples/ConfirmPassword";
import ResetPasswordSuccess from "./views/examples/ResetPasswordSuccess";
import Clients from "views/examples/Clients";
import NouveauClient from "views/examples/NouveauClient";
import NouvelleFacture from "views/examples/NouvelleFacture";
import Corbeille from "views/examples/Corbeille";
import ClientStatusPage from "views/examples/ClientStatusPage";
import Agenda from "views/examples/Agenda";
import Factures from "views/examples/Factures";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: Index,
    layout: "/admin",
    api: false
  },
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "ni ni-planet text-blue",
  //   component: Icons,
  //   layout: "/admin",
  //   api: false
  // },
  {
    path: "/maps",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: Maps,
    layout: "/admin",
    api: false
  },
  {
    path: "/user-profile",
    name: "Profil Utilisateur",
    icon: "ni ni-circle-08 text-yellow",
    component: Profile,
    layout: "/admin",
    api: true,
    hidden: true
  },
  
  {
    path: "/statutClient/:status",
    name: "ClientStatusPage",
    icon: "ni ni-bullet-list-67 text-red",
    component: ClientStatusPage,
    layout: "/admin",
    api: false,
    hidden: true
  },
  {
    path: "/agenda",
    name: "Agenda",
    icon: "ni ni-calendar-grid-58",
    component: Agenda,
    layout: "/admin",
    api: false,
  },
  {
    path: "/clients",
    name: "Clients ",
    icon: "ni ni-single-02",
    component: Clients,
    layout: "/admin",
    api: false,
  },     
      {
        path: "/corbeille",
        name: "Corbeille",
        icon: "ni ni-folder-17 text-red",
        component: Corbeille,
        layout: "/admin",
        api: false,
      },
      {
        path: "/tables",
        name: "Statuts Clients",
        icon: "ni ni-bullet-list-67 text-red",
        component: Tables,
        layout: "/admin",
        api: false
      },
      {
        path: "/factures",
        name: "Factures",
        icon: "ni ni-money-coins",
        component: Factures,
        layout: "/admin",
        api: false
      },
  {
    path: "/nouveauClient",
    name: "Nouveau Client",
    icon: "ni ni-fat-add", // ou supprimez complètement l'icône
    component: NouveauClient,
    layout: "/admin",
    api: false,
    hidden: true // Ajouté pour cacher cette route dans le menu
  },
  {
    path: "/nouvelleFacture",
    name: "Nouvelle Facture",
    icon: "ni ni-fat-add", // ou supprimez complètement l'icône
    component: NouvelleFacture,
    layout: "/admin",
    api: false,
    hidden: true // Ajouté pour cacher cette route dans le menu
  },
  {
    path: "/login",
    name: "Connexion",
    icon: "ni ni-key-25 text-info",
    component: Login,
    layout: "/auth",
    api: true,
    hidden: true
  },
  {
    path: "/register",
    name: "Inscription",
    icon: "ni ni-circle-08 text-pink",
    component: Register,
    layout: "/auth",
    api: true,
    hidden: true
  },
  {
    path: "/confirm-email/:id",
    name: "Confirmer Email",
    icon: "ni ni-check-bold text-green",
    component: ConfirmEmail,
    layout: "/auth",
    api: true,
    hidden: true
  },
  {
    path: "/edit-profile",
    name: "Modifier Profil",
    icon: "ni ni-ruler-pencil text-info",
    component: EditProfile,
    layout: "/admin",
    api: true,
    hidden: true
  },
  {
    path: "/users",
    name: "Utilisateurs",
    icon: "ni ni-folder-17 text-pink",
    component: UsersTable,
    layout: "/admin",
    api: true,
    hidden: true
  },
  {
    path: "/reset-password",
    name: "Réinitialiser le mot de passe",
    icon: "ni ni-folder-17 text-pink",
    component: ResetPassword,
    layout: "/auth",
    api: true,
    hidden: true
  },
  {
    path: "/confirm-password/:id",
    name: "Confirmer le mot de passe",
    icon: "ni ni-folder-17 text-pink",
    component: ConfirmPassword,
    layout: "/auth",
    api: true,
    hidden: true
  },
  {
    path: "/reset-success",
    name: "Réinitialisation du mot de passe confirmée",
    icon: "ni ni-folder-17 text-pink",
    component: ResetPasswordSuccess,
    layout: "/auth",
    api: false,
    hidden: true
  }
];
export default routes;