// @/data/elearningData.ts
//
// File ini sekarang hanya menjadi re-exporter.
// Data dipecah ke file-file terpisah supaya bundler tidak stack overflow
// ketika me-load satu file yang terlalu besar sekaligus.

export { streams }          from "@/data/streamsData";
export { coursesByStream }  from "@/data/coursesData";
export { modulesByCourse }  from "@/data/modulesData";
export { materialsByModule } from "@/data/materialsData";
export { materialsContentBySubModule } from "@/data/materialsContentData";