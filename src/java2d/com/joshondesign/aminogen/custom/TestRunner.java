package com.joshondesign.aminogen.custom;
import com.joshondesign.aminogen.generated.out.Callback;
import com.joshondesign.aminogen.generated.out.Core;

import java.lang.reflect.Method;

public class TestRunner {
    public static void main(final String ... args) {
        CoreImpl core = new CoreImpl();
        core.start(new Callback() {
            public void call(Object core) {
                try {
                    Object inst = new com.joshondesign.aminogen.generated.out.SimpleTest();
                    //Class clss = getClass().forName(args[0]);
                    //Class clss = Class.forName(args[0]);
                    //Object inst = clss.newInstance();
                    Method meth = inst.getClass().getMethod("run",Core.class);
                    meth.invoke(inst,core);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        });
    }
}
