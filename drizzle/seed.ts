import "dotenv/config";
import { db } from "../src/db";
import {
  barbershop,
  capster,
  layanan,
  pelanggan,
  shiftCapster,
  users,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Memulai seed database BARBERIN sesuai ERD...");

  // 1. Barbershop
  let [shop] = await db
    .select()
    .from(barbershop)
    .where(eq(barbershop.nama_barbershop, "BARBERIN Headquarter"))
    .limit(1);

  if (!shop) {
    [shop] = await db
      .insert(barbershop)
      .values({
        nama_barbershop: "BARBERIN Headquarter",
        alamat: "Jl. Jenderal Soedirman No. 123, Purbalingga",
        no_hp: "0812-3456-7890",
        jam_buka: "08:00",
        jam_tutup: "21:00",
        status: "active",
      })
      .returning();
    console.log(`✅ Barbershop dibuat: ${shop.nama_barbershop}`);
  }

  // 2. Layanan
  const serviceList = [
    {
      nama: "Haircut / Potong Rambut",
      desc: "Potong rambut rapi dan presisi oleh capster profesional.",
      durasi: 30,
      harga: "30000",
    },
    {
      nama: "Hair Wash / Keramas",
      desc: "Cuci rambut dengan sampo premium dan pijatan kepala rileks.",
      durasi: 15,
      harga: "20000",
    },
    {
      nama: "Styling / Tata Rambut",
      desc: "Penataan gaya rambut dengan pomade atau wax berkualitas.",
      durasi: 15,
      harga: "25000",
    },
    {
      nama: "Shaving / Cukur Kumis & Jenggot",
      desc: "Merapikan kumis dan jenggot dengan pisau steril dan handuk hangat.",
      durasi: 20,
      harga: "15000",
    },
    {
      nama: "Hair Coloring / Pewarnaan",
      desc: "Pewarnaan rambut tren modern dengan cat rambut aman.",
      durasi: 60,
      harga: "60000",
    },
    {
      nama: "Beard Trim / Rapikan Jenggot",
      desc: "Membentuk dan mencukur jenggot sesuai kontur wajah.",
      durasi: 15,
      harga: "15000",
    },
    {
      nama: "Kids Haircut / Cukur Anak",
      desc: "Potong rambut anak yang ramah, teliti, dan sabar.",
      durasi: 25,
      harga: "25000",
    },
  ];

  for (const s of serviceList) {
    const existing = await db
      .select()
      .from(layanan)
      .where(eq(layanan.nama_layanan, s.nama))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(layanan).values({
        id_barbershop: shop.id_barbershop,
        nama_layanan: s.nama,
        deskripsi: s.desc,
        durasi_menit: s.durasi,
        harga: s.harga,
        status: "active",
      });
      console.log(`✅ Layanan dibuat: ${s.nama}`);
    }
  }

  // 3. Capsters
  const capsterData = [
    {
      name: "Budi",
      email: "budi@barberin.test",
      phone: "081234567891",
      no_pegawai: "CAP-001",
    },
    {
      name: "Andi",
      email: "andi@barberin.test",
      phone: "081234567892",
      no_pegawai: "CAP-002",
    },
  ];

  for (const c of capsterData) {
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, c.email))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          email: c.email,
          nama_lengkap: c.name,
          no_hp: c.phone,
          role: "capster",
          status: "active",
        })
        .returning();
    }

    const [existingCapster] = await db
      .select()
      .from(capster)
      .where(eq(capster.id_user, user.id_user))
      .limit(1);

    if (!existingCapster) {
      await db.insert(capster).values({
        id_user: user.id_user,
        id_barbershop: shop.id_barbershop,
        no_pegawai: c.no_pegawai,
        status: "active",
      });
      console.log(`✅ Capster dibuat: ${c.name}`);
    }
  }

  // 4. Pelanggan Demo
  let [custUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "ricky.pratama@barberin.test"))
    .limit(1);

  if (!custUser) {
    [custUser] = await db
      .insert(users)
      .values({
        email: "ricky.pratama@barberin.test",
        nama_lengkap: "Ricky Pratama",
        no_hp: "081234567890",
        role: "pelanggan",
        status: "active",
      })
      .returning();
  }

  const [existingPelanggan] = await db
    .select()
    .from(pelanggan)
    .where(eq(pelanggan.id_user, custUser.id_user))
    .limit(1);

  if (!existingPelanggan) {
    await db.insert(pelanggan).values({
      id_user: custUser.id_user,
      alamat: "Purbalingga Lor",
      jenis_kelamin: "Laki-laki",
    });
    console.log(`✅ Pelanggan demo dibuat: ${custUser.nama_lengkap}`);
  }

  console.log("🎉 Seed BARBERIN selesai!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed gagal:", error);
  process.exit(1);
});