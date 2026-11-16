// Daftar simbol, struktur, dan contoh persamaan untuk palet Equation.
// Hanya data UI — yang tersimpan di database tetap satu string LaTeX per
// persamaan. Menambah simbol/contoh cukup edit file ini.
//
// `insert`  : LaTeX yang disisipkan ke editor. `\placeholder{}` = kotak isian
//             kosong (Tab pindah ke kotak berikutnya, seperti di Word).
// `preview` : LaTeX untuk gambar tombol (tanpa placeholder). Default = insert.

export interface PaletteItem {
  insert: string;
  preview?: string;
  title: string;
}

export interface PaletteGroup {
  id: string;
  label: string;
  items: PaletteItem[];
}

export interface ExampleItem {
  title: string;
  latex: string;
}

export interface ExampleGroup {
  id: string;
  label: string;
  items: ExampleItem[];
}

const P = String.raw`\placeholder{}`;
const sym = (latex: string, title: string): PaletteItem => ({
  insert: latex,
  title,
});

// ─── 1. Symbols ──────────────────────────────────────────────────────────────
export const SYMBOL_GROUPS: PaletteGroup[] = [
  {
    id: "basic",
    label: "Basic Math",
    items: [
      sym("+", "Plus"),
      sym("-", "Minus"),
      sym(String.raw`\times`, "Times"),
      sym(String.raw`\div`, "Divide"),
      sym("=", "Equals"),
      sym(String.raw`\neq`, "Not equal"),
      sym(String.raw`\approx`, "Approximately"),
      sym(String.raw`\cdot`, "Dot product"),
    ],
  },
  {
    id: "greek",
    label: "Greek Letters",
    items: [
      sym(String.raw`\alpha`, "alpha"),
      sym(String.raw`\beta`, "beta"),
      sym(String.raw`\gamma`, "gamma"),
      sym(String.raw`\delta`, "delta"),
      sym(String.raw`\epsilon`, "epsilon"),
      sym(String.raw`\theta`, "theta"),
      sym(String.raw`\lambda`, "lambda"),
      sym(String.raw`\mu`, "mu"),
      sym(String.raw`\pi`, "pi"),
      sym(String.raw`\sigma`, "sigma"),
      sym(String.raw`\omega`, "omega"),
      sym(String.raw`\eta`, "eta"),
      sym(String.raw`\zeta`, "zeta"),
      sym(String.raw`\kappa`, "kappa"),
      sym(String.raw`\nu`, "nu"),
      sym(String.raw`\xi`, "xi"),
      sym(String.raw`\rho`, "rho"),
      sym(String.raw`\tau`, "tau"),
      sym(String.raw`\phi`, "phi"),
      sym(String.raw`\chi`, "chi"),
      sym(String.raw`\psi`, "psi"),
      sym(String.raw`\Gamma`, "Gamma"),
      sym(String.raw`\Delta`, "Delta"),
      sym(String.raw`\Theta`, "Theta"),
      sym(String.raw`\Lambda`, "Lambda"),
      sym(String.raw`\Pi`, "Pi"),
      sym(String.raw`\Sigma`, "Sigma"),
      sym(String.raw`\Phi`, "Phi"),
      sym(String.raw`\Psi`, "Psi"),
      sym(String.raw`\Omega`, "Omega"),
    ],
  },
  {
    id: "relations",
    label: "Relations",
    items: [
      sym("<", "Less than"),
      sym(">", "Greater than"),
      sym(String.raw`\leq`, "Less than or equal"),
      sym(String.raw`\geq`, "Greater than or equal"),
      sym(String.raw`\equiv`, "Equivalent"),
      sym(String.raw`\propto`, "Proportional to"),
      sym(String.raw`\sim`, "Similar to"),
    ],
  },
  {
    id: "sets",
    label: "Set Theory",
    items: [
      sym(String.raw`\in`, "Element of"),
      sym(String.raw`\notin`, "Not an element of"),
      sym(String.raw`\subset`, "Subset"),
      sym(String.raw`\subseteq`, "Subset or equal"),
      sym(String.raw`\cup`, "Union"),
      sym(String.raw`\cap`, "Intersection"),
      sym(String.raw`\emptyset`, "Empty set"),
    ],
  },
  {
    id: "logic",
    label: "Logic",
    items: [
      sym(String.raw`\land`, "And"),
      sym(String.raw`\lor`, "Or"),
      sym(String.raw`\neg`, "Not"),
      sym(String.raw`\Rightarrow`, "Implies"),
      sym(String.raw`\Leftrightarrow`, "If and only if"),
      sym(String.raw`\forall`, "For all"),
      sym(String.raw`\exists`, "There exists"),
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    items: [
      sym(String.raw`\partial`, "Partial derivative"),
      sym(String.raw`\nabla`, "Nabla"),
      sym(String.raw`\int`, "Integral"),
      sym(String.raw`\oint`, "Contour integral"),
      sym(String.raw`\sum`, "Summation"),
      sym(String.raw`\prod`, "Product"),
    ],
  },
  {
    id: "arrows",
    label: "Arrows",
    items: [
      sym(String.raw`\rightarrow`, "Right arrow"),
      sym(String.raw`\leftarrow`, "Left arrow"),
      sym(String.raw`\leftrightarrow`, "Left-right arrow"),
      sym(String.raw`\Rightarrow`, "Double right arrow"),
      sym(String.raw`\mapsto`, "Maps to"),
    ],
  },
  {
    id: "other",
    label: "Other Symbols",
    items: [
      sym(String.raw`\infty`, "Infinity"),
      sym(String.raw`\degree`, "Degree"),
      sym(String.raw`\pm`, "Plus-minus"),
      sym(String.raw`\mp`, "Minus-plus"),
      {
        insert: String.raw`\sqrt{${P}}`,
        preview: String.raw`\sqrt{\ }`,
        title: "Square root",
      },
      sym(String.raw`\therefore`, "Therefore"),
    ],
  },
];

// ─── 2. Structures ───────────────────────────────────────────────────────────
export const STRUCTURE_GROUPS: PaletteGroup[] = [
  {
    id: "fractions",
    label: "Fractions",
    items: [
      {
        insert: String.raw`\frac{${P}}{${P}}`,
        preview: String.raw`\dfrac{a}{b}`,
        title: "Stacked fraction",
      },
      {
        insert: String.raw`\tfrac{${P}}{${P}}`,
        preview: String.raw`\tfrac{a}{b}`,
        title: "Small fraction",
      },
      {
        insert: String.raw`\frac{d${P}}{d${P}}`,
        preview: String.raw`\frac{dy}{dx}`,
        title: "Derivative",
      },
      {
        insert: String.raw`\frac{\partial ${P}}{\partial ${P}}`,
        preview: String.raw`\frac{\partial f}{\partial x}`,
        title: "Partial derivative",
      },
    ],
  },
  {
    id: "scripts",
    label: "Scripts",
    items: [
      {
        insert: String.raw`${P}^{${P}}`,
        preview: String.raw`x^{n}`,
        title: "Superscript",
      },
      {
        insert: String.raw`${P}_{${P}}`,
        preview: String.raw`x_{i}`,
        title: "Subscript",
      },
      {
        insert: String.raw`${P}_{${P}}^{${P}}`,
        preview: String.raw`x_{i}^{2}`,
        title: "Subscript and superscript",
      },
      {
        insert: String.raw`${P}^{2}`,
        preview: String.raw`x^2`,
        title: "Squared",
      },
      {
        insert: String.raw`${P}^{3}`,
        preview: String.raw`x^3`,
        title: "Cubed",
      },
      {
        insert: String.raw`${P}_{n}`,
        preview: String.raw`a_n`,
        title: "Subscript n",
      },
    ],
  },
  {
    id: "radicals",
    label: "Radicals",
    items: [
      {
        insert: String.raw`\sqrt{${P}}`,
        preview: String.raw`\sqrt{x}`,
        title: "Square root",
      },
      {
        insert: String.raw`\sqrt[3]{${P}}`,
        preview: String.raw`\sqrt[3]{x}`,
        title: "Cube root",
      },
      {
        insert: String.raw`\sqrt[${P}]{${P}}`,
        preview: String.raw`\sqrt[n]{x}`,
        title: "Nth root",
      },
    ],
  },
  {
    id: "integrals",
    label: "Integrals",
    items: [
      {
        insert: String.raw`\int ${P}\,dx`,
        preview: String.raw`\int f(x)\,dx`,
        title: "Indefinite integral",
      },
      {
        insert: String.raw`\int_{${P}}^{${P}} ${P}\,dx`,
        preview: String.raw`\int_a^b f(x)\,dx`,
        title: "Definite integral",
      },
      {
        insert: String.raw`\iint ${P}\,dA`,
        preview: String.raw`\iint f\,dA`,
        title: "Double integral",
      },
      {
        insert: String.raw`\oint ${P}\,ds`,
        preview: String.raw`\oint f\,ds`,
        title: "Contour integral",
      },
    ],
  },
  {
    id: "operators",
    label: "Large Operators",
    items: [
      {
        insert: String.raw`\sum_{${P}}^{${P}} ${P}`,
        preview: String.raw`\sum_{i=1}^{n}x_i`,
        title: "Summation",
      },
      {
        insert: String.raw`\prod_{${P}}^{${P}} ${P}`,
        preview: String.raw`\prod_{i=1}^{n}x_i`,
        title: "Product",
      },
      {
        insert: String.raw`\bigcup_{${P}}^{${P}} ${P}`,
        preview: String.raw`\bigcup_{i=1}^{n}A_i`,
        title: "Union",
      },
      {
        insert: String.raw`\bigcap_{${P}}^{${P}} ${P}`,
        preview: String.raw`\bigcap_{i=1}^{n}A_i`,
        title: "Intersection",
      },
    ],
  },
  {
    id: "brackets",
    label: "Brackets",
    items: [
      {
        insert: String.raw`\left(${P}\right)`,
        preview: String.raw`(a+b)`,
        title: "Parentheses",
      },
      {
        insert: String.raw`\left[${P}\right]`,
        preview: String.raw`[a+b]`,
        title: "Square brackets",
      },
      {
        insert: String.raw`\left\{${P}\right\}`,
        preview: String.raw`\{a+b\}`,
        title: "Curly braces",
      },
      {
        insert: String.raw`\left|${P}\right|`,
        preview: String.raw`\left|x\right|`,
        title: "Absolute value",
      },
      {
        insert: String.raw`\left\lfloor ${P}\right\rfloor`,
        preview: String.raw`\lfloor x\rfloor`,
        title: "Floor",
      },
      {
        insert: String.raw`\left\lceil ${P}\right\rceil`,
        preview: String.raw`\lceil x\rceil`,
        title: "Ceiling",
      },
      {
        insert: String.raw`\binom{${P}}{${P}}`,
        preview: String.raw`\binom{n}{k}`,
        title: "Binomial coefficient",
      },
    ],
  },
  {
    id: "functions",
    label: "Functions",
    items: [
      sym(String.raw`\sin `, "Sine"),
      sym(String.raw`\cos `, "Cosine"),
      sym(String.raw`\tan `, "Tangent"),
      sym(String.raw`\log `, "Logarithm"),
      sym(String.raw`\ln `, "Natural logarithm"),
      sym(String.raw`\exp `, "Exponential"),
    ].map((i) => ({ ...i, preview: i.insert.trim() })),
  },
  {
    id: "accents",
    label: "Accents",
    items: [
      {
        insert: String.raw`\hat{${P}}`,
        preview: String.raw`\hat{x}`,
        title: "Hat",
      },
      {
        insert: String.raw`\bar{${P}}`,
        preview: String.raw`\bar{x}`,
        title: "Bar",
      },
      {
        insert: String.raw`\vec{${P}}`,
        preview: String.raw`\vec{x}`,
        title: "Vector",
      },
      {
        insert: String.raw`\dot{${P}}`,
        preview: String.raw`\dot{x}`,
        title: "Dot",
      },
      {
        insert: String.raw`\ddot{${P}}`,
        preview: String.raw`\ddot{x}`,
        title: "Double dot",
      },
      {
        insert: String.raw`\tilde{${P}}`,
        preview: String.raw`\tilde{x}`,
        title: "Tilde",
      },
      {
        insert: String.raw`\overline{${P}}`,
        preview: String.raw`\overline{AB}`,
        title: "Overline",
      },
      {
        insert: String.raw`\underline{${P}}`,
        preview: String.raw`\underline{AB}`,
        title: "Underline",
      },
    ],
  },
  {
    id: "limits",
    label: "Limits and Logarithms",
    items: [
      {
        insert: String.raw`\lim_{${P}\to ${P}} ${P}`,
        preview: String.raw`\lim_{x\to 0}f(x)`,
        title: "Limit",
      },
      {
        insert: String.raw`\log_{${P}} ${P}`,
        preview: String.raw`\log_a b`,
        title: "Logarithm with base",
      },
      {
        insert: String.raw`\ln ${P}`,
        preview: String.raw`\ln x`,
        title: "Natural logarithm",
      },
      {
        insert: String.raw`\max_{${P}} ${P}`,
        preview: String.raw`\max_{x}f(x)`,
        title: "Maximum",
      },
      {
        insert: String.raw`\min_{${P}} ${P}`,
        preview: String.raw`\min_{x}f(x)`,
        title: "Minimum",
      },
    ],
  },
  {
    id: "matrices",
    label: "Matrices",
    items: [
      {
        insert: String.raw`\begin{bmatrix}${P} & ${P} \\ ${P} & ${P}\end{bmatrix}`,
        preview: String.raw`\begin{bmatrix} a & b \\ c & d \end{bmatrix}`,
        title: "Matrix 2×2 (brackets)",
      },
      {
        insert: String.raw`\begin{pmatrix}${P} & ${P} \\ ${P} & ${P}\end{pmatrix}`,
        preview: String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}`,
        title: "Matrix 2×2 (parentheses)",
      },
      {
        insert: String.raw`\begin{vmatrix}${P} & ${P} \\ ${P} & ${P}\end{vmatrix}`,
        preview: String.raw`\begin{vmatrix} a & b \\ c & d \end{vmatrix}`,
        title: "Determinant 2×2",
      },
      {
        insert: String.raw`\begin{bmatrix}${P} & ${P} & ${P} \\ ${P} & ${P} & ${P} \\ ${P} & ${P} & ${P}\end{bmatrix}`,
        preview: String.raw`\begin{bmatrix} a & b & c \\ d & e & f \\ g & h & i \end{bmatrix}`,
        title: "Matrix 3×3",
      },
    ],
  },
  {
    id: "arrays",
    label: "Arrays",
    items: [
      {
        insert: String.raw`\begin{aligned}${P} &= ${P} \\ ${P} &= ${P}\end{aligned}`,
        preview: String.raw`\begin{aligned} x+y&=5 \\ 2x-y&=1 \end{aligned}`,
        title: "Aligned equations",
      },
      {
        insert: String.raw`\begin{cases}${P} & ${P} \\ ${P} & ${P}\end{cases}`,
        preview: String.raw`\begin{cases} a & x>0 \\ b & x\le 0 \end{cases}`,
        title: "Cases",
      },
    ],
  },
];

// ─── 3. Contoh persamaan per bidang ──────────────────────────────────────────
export const EXAMPLE_GROUPS: ExampleGroup[] = [
  {
    id: "matematika",
    label: "Matematika",
    items: [
      {
        title: "Teorema binomial",
        latex: String.raw`(x+a)^n=\sum_{k=0}^{n}\binom{n}{k}x^k a^{n-k}`,
      },
      { title: "Persamaan linear", latex: String.raw`ax+b=0` },
      { title: "Persamaan kuadrat", latex: String.raw`ax^2+bx+c=0` },
      {
        title: "Rumus ABC",
        latex: String.raw`x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`,
      },
      { title: "Pythagoras", latex: String.raw`a^2+b^2=c^2` },
      { title: "Luas lingkaran", latex: String.raw`L=\pi r^2` },
      { title: "Keliling lingkaran", latex: String.raw`K=2\pi r` },
      { title: "Barisan aritmetika", latex: String.raw`U_n=a+(n-1)b` },
      { title: "Deret geometri", latex: String.raw`S_n=a\frac{1-r^n}{1-r}` },
    ],
  },
  {
    id: "kalkulus",
    label: "Kalkulus",
    items: [
      { title: "Turunan", latex: String.raw`f'(x)=\frac{dy}{dx}` },
      { title: "Turunan kedua", latex: String.raw`f''(x)=\frac{d^2y}{dx^2}` },
      { title: "Integral tak tentu", latex: String.raw`\int f(x)\,dx` },
      { title: "Integral tentu", latex: String.raw`\int_a^b f(x)\,dx` },
      { title: "Limit", latex: String.raw`\lim_{x\to a}f(x)` },
      {
        title: "Turunan parsial",
        latex: String.raw`\frac{\partial f}{\partial x}`,
      },
    ],
  },
  {
    id: "statistika",
    label: "Statistika & Probabilitas",
    items: [
      { title: "Mean", latex: String.raw`\bar{x}=\frac{\sum x_i}{n}` },
      {
        title: "Varians populasi",
        latex: String.raw`\sigma^2=\frac{\sum(x_i-\mu)^2}{N}`,
      },
      {
        title: "Standar deviasi",
        latex: String.raw`\sigma=\sqrt{\frac{\sum(x_i-\mu)^2}{N}}`,
      },
      { title: "Probabilitas", latex: String.raw`P(A)=\frac{n(A)}{n(S)}` },
      {
        title: "Kombinasi",
        latex: String.raw`\binom{n}{r}=\frac{n!}{r!(n-r)!}`,
      },
      { title: "Permutasi", latex: String.raw`P(n,r)=\frac{n!}{(n-r)!}` },
    ],
  },
  {
    id: "fisika",
    label: "Fisika",
    items: [
      { title: "Kecepatan", latex: String.raw`v=\frac{s}{t}` },
      { title: "Percepatan", latex: String.raw`a=\frac{\Delta v}{\Delta t}` },
      { title: "Gaya Newton", latex: String.raw`F=ma` },
      { title: "Energi kinetik", latex: String.raw`E_k=\frac{1}{2}mv^2` },
      { title: "Energi potensial", latex: String.raw`E_p=mgh` },
      { title: "Hukum Ohm", latex: String.raw`V=IR` },
      { title: "Daya listrik", latex: String.raw`P=VI` },
      { title: "Relativitas Einstein", latex: String.raw`E=mc^2` },
    ],
  },
  {
    id: "informatika",
    label: "Informatika & Komputer",
    items: [
      { title: "Binary to decimal", latex: String.raw`N=\sum_{i=0}^{n}b_i2^i` },
      { title: "Kompleksitas linear", latex: String.raw`T(n)=O(n)` },
      { title: "Kompleksitas kuadrat", latex: String.raw`T(n)=O(n^2)` },
      { title: "Kompleksitas logaritmik", latex: String.raw`T(n)=O(\log n)` },
      { title: "Sigmoid", latex: String.raw`\sigma(x)=\frac{1}{1+e^{-x}}` },
      {
        title: "Softmax",
        latex: String.raw`P(y_i)=\frac{e^{z_i}}{\sum_j e^{z_j}}`,
      },
      {
        title: "Euclidean distance",
        latex: String.raw`d(x,y)=\sqrt{\sum_{i=1}^{n}(x_i-y_i)^2}`,
      },
    ],
  },
];
