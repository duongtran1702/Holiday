public class CheckPayos {
    public static void main(String[] args) {
        try {
            Class<?> clazz = Class.forName("vn.payos.PayOS");
            for (java.lang.reflect.Method m : clazz.getDeclaredMethods()) {
                System.out.println(m.getName() + " -> " + m.getReturnType().getName());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
