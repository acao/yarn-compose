export = pkginfo
declare function pkginfo(pmodule: any, options?: any, ...args: any[]): any
declare namespace pkginfo {
  function find(pmodule: any, dir: any): any
  function read(pmodule: any, dir: any): any
  const version: string
}
