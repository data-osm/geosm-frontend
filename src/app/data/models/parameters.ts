import { Map, VectorProvider } from "../../type/type";

export interface AdminBoundary {
    admin_boundary_id:number
    name:string
    vector:VectorProvider
}

export interface AppExtent{
    a?:number
    b?:number
    c?:number
    d?:number
    st_asgeojson:string
    id:number
    [key:string]:any
}

export interface Parameter{
    parameter_id:number
    map:Map,
    extent:VectorProvider
    extent_pk:number
    boundary:AdminBoundary[],
    appExtent?:AppExtent
}